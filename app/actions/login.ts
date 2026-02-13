// app/actions/login.ts
"use server";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function authenticate(_prevState: string | undefined, formData: FormData) {
  try {
    await signIn("credentials", { ...Object.fromEntries(formData), redirectTo: "/" });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Credenciales incorrectas.";
        default:
          return "Algo salió mal.";
      }
    }
    throw error;
  }
}