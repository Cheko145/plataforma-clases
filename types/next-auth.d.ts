import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "admin" | "student";
    } & DefaultSession["user"];
  }

  interface User {
    role?: "admin" | "student";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "admin" | "student";
  }
}