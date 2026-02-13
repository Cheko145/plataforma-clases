import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASSWORD,
  },
});

async function sendEmail(to: string, subject: string, html: string) {
  await transporter.sendMail({
    from: `"Plataforma de Clases" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    html,
  });
}

export async function sendWelcomeEmail(email: string, name: string) {
  await sendEmail(
    email,
    "¡Bienvenido a la Plataforma de Clases!",
    `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">¡Hola, ${name}!</h2>
      <p>Tu cuenta ha sido creada exitosamente.</p>
      <p><strong>Tu usuario de acceso:</strong> ${email}</p>
      <p>Ya puedes iniciar sesión y comenzar a aprender.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/login"
         style="display:inline-block;background:#2563eb;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;margin-top:16px;">
        Ir a la plataforma
      </a>
      <p style="margin-top: 24px; color: #6b7280; font-size: 14px;">
        Si no creaste esta cuenta, puedes ignorar este correo.
      </p>
    </div>
    `
  );
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  await sendEmail(
    email,
    "Recuperación de contraseña",
    `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Restablecer contraseña</h2>
      <p>Recibimos una solicitud para restablecer tu contraseña.</p>
      <p>Haz clic en el siguiente enlace para crear una nueva contraseña. El enlace expira en <strong>1 hora</strong>.</p>
      <a href="${resetUrl}"
         style="display:inline-block;background:#2563eb;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;margin-top:16px;">
        Restablecer contraseña
      </a>
      <p style="margin-top: 24px; color: #6b7280; font-size: 14px;">
        Si no solicitaste esto, puedes ignorar este correo. Tu contraseña no cambiará.
      </p>
    </div>
    `
  );
}