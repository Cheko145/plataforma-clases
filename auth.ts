// auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getUserByEmail } from "@/lib/users";
import { loginSchema } from "@/lib/validations";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        try {
          const { email, password } = parsed.data;
          const user = await getUserByEmail(email);
          if (!user || !user.password) return null;

          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) {
            return { id: user.id, name: user.name, email: user.email, image: user.image, role: user.role };
          }
        } catch {
          // No exponemos detalles del error al cliente
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id    = token.sub;
        session.user.role  = token.role ?? "student";
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub  = user.id;
        token.role = user.role ?? "student";
      }
      return token;
    },
  },
});