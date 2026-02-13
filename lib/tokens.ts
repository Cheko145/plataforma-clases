import { pool } from "./db";
import { randomUUID } from "crypto";

export async function createPasswordResetToken(userId: string): Promise<string> {
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

  // Eliminar tokens anteriores del mismo usuario
  await pool.query("DELETE FROM password_reset_tokens WHERE user_id = $1", [userId]);

  await pool.query(
    "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
    [userId, token, expiresAt]
  );

  return token;
}

export async function getValidToken(token: string) {
  const result = await pool.query(
    `SELECT * FROM password_reset_tokens
     WHERE token = $1 AND used = false AND expires_at > NOW()
     LIMIT 1`,
    [token]
  );
  return result.rows[0] ?? null;
}

export async function markTokenAsUsed(token: string) {
  await pool.query(
    "UPDATE password_reset_tokens SET used = true WHERE token = $1",
    [token]
  );
}