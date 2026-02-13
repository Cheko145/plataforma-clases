// app/actions/register.ts
"use server";

import bcrypt from "bcryptjs";
import { getUserByEmail, createUser } from "@/lib/users";
import { sendWelcomeEmail } from "@/lib/email";
import { registerSchema } from "@/lib/validations";

export async function registerUser(formData: FormData) {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    // Devolvemos el primer error descriptivo para que el usuario sepa qué corregir
    return { error: parsed.error.issues[0].message };
  }

  const { name, email, password } = parsed.data;

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return { error: "El correo ya está registrado" };
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  await createUser({ name, email, password: hashedPassword });

  // El email de bienvenida no bloquea el registro si el servidor SMTP falla
  try {
    await sendWelcomeEmail(email, name);
  } catch (err) {
    console.error("[register] Error enviando email de bienvenida:", err);
  }

  return { success: true };
}
