import { pool } from "./db";

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  password: string | null;
  email_verified: Date | null;
  image: string | null;
  role: "admin" | "student";
  created_at: Date;
  updated_at: Date;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await pool.query<User>(
    "SELECT * FROM users WHERE email = $1 LIMIT 1",
    [email]
  );
  return result.rows[0] ?? null;
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
}): Promise<User> {
  const result = await pool.query<User>(
    `INSERT INTO users (name, email, password)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [data.name, data.email, data.password]
  );
  return result.rows[0];
}

export async function getUserById(id: string): Promise<User | null> {
  const result = await pool.query<User>(
    "SELECT * FROM users WHERE id = $1 LIMIT 1",
    [id]
  );
  return result.rows[0] ?? null;
}

export async function updatePassword(userId: string, hashedPassword: string) {
  await pool.query(
    "UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2",
    [hashedPassword, userId]
  );
}
