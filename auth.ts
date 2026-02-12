// auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "./app/generated/prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

// Esquema de validación para login
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" }, // Usamos JWT para no depender de llamadas constantes a BD
  pages: {
    signIn: "/login", // Nuestra página personalizada
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = loginSchema.safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          
          // 1. Buscar usuario
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user || !user.password) return null;

          // 2. Verificar contraseña
          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) return user;
        }

        console.log("Credenciales inválidas");
        return null;
      },
    }),
  ],
  callbacks: {
    // Esto mete el ID y el Nombre en la sesión para usarlos en el frontend
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub; // Guardamos el ID
      }
      return session;
    },
    async jwt({ token, user }) {
        // user solo llega la primera vez al loguearse
        if (user) {
            token.sub = user.id;
        }
        return token;
    }
  }
});