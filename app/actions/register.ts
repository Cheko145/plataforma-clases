// app/actions/register.ts
"use server";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";


const connectionString = `${process.env.DATABASE_URL}`

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })


const registerSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export async function registerUser(formData: FormData) {
  // 1. Validar datos
  const data = Object.fromEntries(formData);
  const parsed = registerSchema.safeParse(data);

  if (!parsed.success) {
    return { error: "Datos inválidos" };
  }

  const { name, email, password } = parsed.data;

  // 2. Verificar si ya existe
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: "El correo ya está registrado" };
  }

  // 3. Hashear contraseña
  const hashedPassword = await bcrypt.hash(password, 10);

  // 4. Crear usuario
  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  return { success: true };
}