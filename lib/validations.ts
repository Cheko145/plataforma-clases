/**
 * validations.ts
 * Esquemas Zod centralizados. Todas las validaciones de formularios se
 * definen aquí para evitar duplicación (DRY) y garantizar consistencia.
 */
import { z } from "zod";

// ---------------------------------------------------------------------------
// Contraseña segura (se reutiliza en registro y recuperación)
// ---------------------------------------------------------------------------
export const passwordSchema = z
  .string()
  .min(8, "Mínimo 8 caracteres")
  .regex(/[A-Z]/, "Debe incluir al menos una letra mayúscula")
  .regex(/[0-9]/, "Debe incluir al menos un número")
  .regex(/[^A-Za-z0-9]/, "Debe incluir al menos un carácter especial (!@#$…)");

// ---------------------------------------------------------------------------
// Login — solo verifica formato básico; la fuerza de la contraseña
// no se valida aquí para no bloquear contraseñas antiguas débiles.
// ---------------------------------------------------------------------------
export const loginSchema = z.object({
  email: z.email("Correo inválido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});

// ---------------------------------------------------------------------------
// Registro
// ---------------------------------------------------------------------------
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre es demasiado largo"),
  email: z.email("Correo inválido"),
  password: passwordSchema,
});

// ---------------------------------------------------------------------------
// Restablecer contraseña
// ---------------------------------------------------------------------------
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token requerido"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });
