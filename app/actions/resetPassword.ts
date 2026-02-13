// app/actions/resetPassword.ts
"use server";

import bcrypt from "bcryptjs";
import { getValidToken, markTokenAsUsed } from "@/lib/tokens";
import { updatePassword } from "@/lib/users";
import { redirect } from "next/navigation";
import { resetPasswordSchema } from "@/lib/validations";

export async function resetPassword(_prevState: string | undefined, formData: FormData) {
  const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return parsed.error.issues[0].message;
  }

  const { token, password } = parsed.data;

  try {
    const record = await getValidToken(token);
    if (!record) return "El enlace es inválido o ya expiró.";

    const hashedPassword = await bcrypt.hash(password, 12);
    await updatePassword(record.user_id, hashedPassword);
    await markTokenAsUsed(token);
  } catch (err) {
    console.error("[resetPassword] Error:", err);
    return "Ocurrió un error. Intenta de nuevo.";
  }

  redirect("/login?reset=true");
}
