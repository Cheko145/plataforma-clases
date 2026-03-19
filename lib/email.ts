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
    from: `"Aula Virtual" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    html,
  });
}

function emailLayout(accentColor: string, content: string) {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:${accentColor};border-radius:12px 12px 0 0;padding:28px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <span style="display:inline-block;background:rgba(255,255,255,0.18);border-radius:8px;padding:6px 10px;margin-bottom:12px;">
                    <span style="color:#fff;font-size:16px;font-weight:700;letter-spacing:0.5px;">📚 Aula Virtual</span>
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:36px 40px;">
            ${content}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;border-radius:0 0 12px 12px;padding:20px 40px;">
            <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6;">
              Este correo fue enviado automáticamente por <strong>Aula Virtual</strong>. Por favor no respondas a este mensaje.<br>
              Si tienes alguna duda, contacta a tu administrador.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function btn(href: string, label: string, color: string) {
  return `<a href="${href}" style="display:inline-block;background:${color};color:#ffffff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;text-decoration:none;letter-spacing:0.3px;">${label}</a>`;
}

function divider() {
  return `<hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">`;
}

export async function sendWelcomeEmail(email: string, name: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const content = `
    <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#0f172a;">¡Bienvenido, ${name}!</h1>
    <p style="margin:0 0 20px;font-size:14px;color:#64748b;">Tu cuenta ha sido creada exitosamente en Aula Virtual.</p>
    ${divider()}
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;margin-bottom:24px;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.8px;">Tu acceso</p>
          <p style="margin:0;font-size:15px;font-weight:600;color:#1e293b;">${email}</p>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 24px;font-size:14px;color:#475569;">Ya puedes iniciar sesión y comenzar a aprender. Si tienes dudas, contacta a tu administrador.</p>
    ${btn(`${appUrl}/login`, "Iniciar sesión →", "#4f46e5")}
    ${divider()}
    <p style="margin:0;font-size:12px;color:#94a3b8;">Si no esperabas este correo, puedes ignorarlo con seguridad.</p>
  `;
  await sendEmail(email, "Bienvenido a Aula Virtual — Tu cuenta está lista", emailLayout("#4f46e5", content));
}

export async function sendGroupAssignmentEmail(
  email: string,
  name: string,
  groupName: string,
  courses: { title: string; deadline: Date | null; course_id: string; youtube_url: string }[]
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const pendingCourses = courses.filter((c) => c.deadline !== null);

  const coursesRows = courses.length > 0
    ? courses.map((c) => {
        const videoId = getYouTubeID(c.youtube_url);
        const href = `${appUrl}/courses/${c.course_id}/${videoId}`;
        const deadlineLabel = c.deadline
          ? `<span style="display:inline-block;background:#fef2f2;color:#dc2626;font-size:11px;font-weight:600;padding:2px 8px;border-radius:20px;border:1px solid #fecaca;">Vence el ${new Date(c.deadline).toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" })}</span>`
          : `<span style="display:inline-block;background:#f0fdf4;color:#16a34a;font-size:11px;font-weight:600;padding:2px 8px;border-radius:20px;border:1px solid #bbf7d0;">Sin fecha límite</span>`;
        return `
          <tr>
            <td style="padding:14px 0;border-bottom:1px solid #f1f5f9;">
              <a href="${href}" style="display:block;font-size:14px;font-weight:600;color:#4f46e5;text-decoration:none;margin-bottom:6px;">${c.title}</a>
              ${deadlineLabel}
            </td>
          </tr>`;
      }).join("")
    : `<tr><td style="padding:16px 0;font-size:14px;color:#94a3b8;">El grupo aún no tiene videos asignados.</td></tr>`;

  const summaryLabel = pendingCourses.length > 0
    ? `Tienes <strong>${pendingCourses.length} video(s) con fecha límite</strong> pendiente(s). No olvides revisarlos.`
    : courses.length > 0
    ? `Tienes <strong>${courses.length} video(s) disponible(s)</strong> en este grupo.`
    : "El grupo aún no tiene contenido asignado.";

  const content = `
    <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#0f172a;">Fuiste asignado a un grupo</h1>
    <p style="margin:0 0 20px;font-size:14px;color:#64748b;">Te damos la bienvenida al grupo <strong style="color:#1e293b;">"${groupName}"</strong>.</p>
    ${divider()}
    <p style="margin:0 0 16px;font-size:14px;color:#475569;">${summaryLabel}</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${coursesRows}
    </table>
    <div style="margin-top:28px;">
      ${btn(`${appUrl}/`, "Ver mis clases →", "#4f46e5")}
    </div>
  `;
  await sendEmail(email, `Fuiste asignado al grupo "${groupName}"`, emailLayout("#4f46e5", content));
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

  const deadlineBlock = deadline
    ? `<table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;margin-bottom:24px;">
        <tr><td style="padding:14px 20px;">
          <p style="margin:0 0 2px;font-size:11px;font-weight:600;color:#dc2626;text-transform:uppercase;letter-spacing:0.8px;">Fecha límite</p>
          <p style="margin:0;font-size:15px;font-weight:700;color:#991b1b;">${new Date(deadline).toLocaleDateString("es-MX", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}</p>
        </td></tr>
      </table>`
    : "";

  const messageBlock = adminMessage
    ? `<table width="100%" cellpadding="0" cellspacing="0" style="background:#eff6ff;border-left:4px solid #4f46e5;border-radius:0 8px 8px 0;margin-bottom:24px;">
        <tr><td style="padding:14px 18px;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#4f46e5;text-transform:uppercase;letter-spacing:0.8px;">Mensaje del instructor</p>
          <p style="margin:0;font-size:14px;color:#1e3a8a;line-height:1.6;">${adminMessage}</p>
        </td></tr>
      </table>`
    : "";

  const content = `
    <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#0f172a;">Nuevo video asignado</h1>
    <p style="margin:0 0 20px;font-size:14px;color:#64748b;">Hola <strong style="color:#1e293b;">${name}</strong>, se ha asignado un nuevo video a tu grupo.</p>
    ${divider()}
    <p style="margin:0 0 8px;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.8px;">Grupo</p>
    <p style="margin:0 0 16px;font-size:14px;font-weight:600;color:#1e293b;">${groupName}</p>
    <p style="margin:0 0 8px;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.8px;">Video</p>
    <p style="margin:0 0 20px;font-size:18px;font-weight:700;color:#1e293b;">${videoTitle}</p>
    ${deadlineBlock}
    ${messageBlock}
    ${btn(href, "Ver video →", "#4f46e5")}
  `;
  await sendEmail(email, `Nuevo video: "${videoTitle}"`, emailLayout("#4f46e5", content));
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
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const content = `
    <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#0f172a;">Tienes una tarea pendiente</h1>
    <p style="margin:0 0 20px;font-size:14px;color:#64748b;">Hola <strong style="color:#1e293b;">${name}</strong>, te recordamos que el siguiente video vence <strong>mañana</strong>.</p>
    ${divider()}
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;margin-bottom:20px;">
      <tr><td style="padding:20px;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#dc2626;text-transform:uppercase;letter-spacing:0.8px;">⚠ Vence mañana</p>
        <p style="margin:0 0 8px;font-size:17px;font-weight:700;color:#0f172a;">${videoTitle}</p>
        <p style="margin:0;font-size:13px;color:#991b1b;font-weight:500;">${deadlineStr}</p>
      </td></tr>
    </table>
    <p style="margin:0 0 24px;font-size:14px;color:#475569;">Asegúrate de ver el video y completar las actividades antes de que venza la fecha.</p>
    ${btn(href, "Ver video ahora →", "#dc2626")}
  `;
  await sendEmail(email, `⏰ Recordatorio: "${videoTitle}" vence mañana`, emailLayout("#dc2626", content));
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const content = `
    <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#0f172a;">Restablece tu contraseña</h1>
    <p style="margin:0 0 20px;font-size:14px;color:#64748b;">Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
    ${divider()}
    <p style="margin:0 0 8px;font-size:14px;color:#475569;">Haz clic en el siguiente botón para crear una nueva contraseña. <strong>El enlace expira en 1 hora.</strong></p>
    <div style="margin:24px 0;">
      ${btn(resetUrl, "Restablecer contraseña →", "#4f46e5")}
    </div>
    ${divider()}
    <p style="margin:0;font-size:12px;color:#94a3b8;">Si no solicitaste restablecer tu contraseña, ignora este correo. Tu cuenta seguirá siendo segura.</p>
  `;
  await sendEmail(email, "Restablece tu contraseña — Aula Virtual", emailLayout("#4f46e5", content));
}
