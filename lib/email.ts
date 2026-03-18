import nodemailer from "nodemailer";
import { getYouTubeID } from "@/lib/courses-db";

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

export async function sendGroupAssignmentEmail(
  email: string,
  name: string,
  groupName: string,
  courses: { title: string; deadline: Date | null; course_id: string; youtube_url: string }[]
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const pendingCourses = courses.filter((c) => c.deadline !== null);
  const coursesHtml =
    courses.length > 0
      ? `<ul style="padding-left:20px;">` +
        courses
          .map((c) => {
            const videoId = getYouTubeID(c.youtube_url);
            const href = `${appUrl}/courses/${c.course_id}/${videoId}`;
            return `<li style="margin-bottom:8px;">
                <a href="${href}" style="color:#2563eb;text-decoration:none;font-weight:bold;">${c.title}</a>
                ${c.deadline ? `<span style="color:#dc2626;font-size:13px;"> — vence el ${new Date(c.deadline).toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" })}</span>` : ""}
              </li>`;
          })
          .join("") +
        `</ul>`
      : `<p style="color:#6b7280;">El grupo aún no tiene videos asignados.</p>`;

  await sendEmail(
    email,
    `Te asignaron al grupo "${groupName}"`,
    `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">¡Hola, ${name}!</h2>
      <p>Fuiste agregado al grupo <strong>"${groupName}"</strong>.</p>
      ${
        pendingCourses.length > 0
          ? `<p>Tienes <strong>${pendingCourses.length} video(s) con fecha límite</strong> pendiente(s):</p>`
          : courses.length > 0
          ? `<p>Tienes <strong>${courses.length} video(s) disponible(s)</strong>:</p>`
          : ""
      }
      ${coursesHtml}
      <a href="${appUrl}/login"
         style="display:inline-block;background:#2563eb;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;margin-top:16px;">
        Ir a la plataforma
      </a>
    </div>
    `
  );
}

export async function sendVideoAssignmentEmail(
  email: string,
  name: string,
  videoTitle: string,
  groupName: string,
  courseId: string,
  youtubeUrl: string,
  deadline: Date | null,
  adminMessage: string | null
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const videoId = getYouTubeID(youtubeUrl);
  const href = `${appUrl}/courses/${courseId}/${videoId}`;
  const deadlineHtml = deadline
    ? `<p>📅 <strong>Fecha límite:</strong> <span style="color:#dc2626;">${new Date(deadline).toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" })}</span></p>`
    : "";
  const messageHtml = adminMessage
    ? `<p style="background:#f3f4f6;border-left:4px solid #2563eb;padding:10px 16px;border-radius:4px;margin:16px 0;">${adminMessage}</p>`
    : "";

  await sendEmail(
    email,
    `Nuevo video asignado: "${videoTitle}"`,
    `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">¡Hola, ${name}!</h2>
      <p>Se te ha asignado un nuevo video en el grupo <strong>"${groupName}"</strong>:</p>
      <h3 style="color:#111827;">${videoTitle}</h3>
      ${deadlineHtml}
      ${messageHtml}
      <a href="${href}"
         style="display:inline-block;background:#2563eb;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;margin-top:16px;">
        Ver video
      </a>
    </div>
    `
  );
}

export async function sendDeadlineReminderEmail(
  email: string,
  name: string,
  videoTitle: string,
  deadline: Date,
  courseId: string,
  youtubeUrl: string
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const videoId = getYouTubeID(youtubeUrl);
  const href = `${appUrl}/courses/${courseId}/${videoId}`;
  const deadlineStr = new Date(deadline).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  await sendEmail(
    email,
    `⏰ Recordatorio: "${videoTitle}" vence mañana`,
    `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">¡Tienes una tarea pendiente!</h2>
      <p>Hola <strong>${name}</strong>, te recordamos que tienes un video pendiente que vence <strong>mañana</strong>:</p>
      <h3 style="color:#111827;">${videoTitle}</h3>
      <p>📅 <strong>Fecha límite:</strong> <span style="color:#dc2626;">${deadlineStr}</span></p>
      <a href="${href}"
         style="display:inline-block;background:#dc2626;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;margin-top:16px;">
        Ver video ahora
      </a>
      <p style="margin-top: 24px; color: #6b7280; font-size: 14px;">
        No dejes pasar la fecha límite.
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