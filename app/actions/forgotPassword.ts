"use server";

import { z } from "zod";
import { getUserByEmail } from "@/lib/users";
import { createPasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/email";

const schema = z.object({
  email: z.email(),
});

export async function forgotPassword(_prevState: string | undefined, formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return "Email inválido.";

  const { email } = parsed.data;

  try {
    const user = await getUserByEmail(email);
    if (user) {
      const token = await createPasswordResetToken(user.id);
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/${token}`;
      await sendPasswordResetEmail(email, resetUrl);
    }
    // Siempre devolvemos el mismo mensaje para no revelar si el email existe
    return "ok";
  } catch (err) {
    console.error("[forgotPassword] Error:", err);
    return "Ocurrió un error. Intenta de nuevo.";
  }
}