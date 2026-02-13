import { getAllAnswers } from "@/lib/answers";
import { auth } from "@/auth";
import ExcelJS from "exceljs";

export async function GET() {
  // Solo los administradores pueden exportar datos
  const session = await auth();
  if (!session?.user) {
    return new Response("No autorizado", { status: 401 });
  }
  if (session.user.role !== "admin") {
    return new Response("Acceso denegado", { status: 403 });
  }

  const answers = await getAllAnswers();

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Respuestas");

  sheet.columns = [
    { header: "Alumno",      key: "user_name",   width: 22 },
    { header: "Email",       key: "user_email",  width: 30 },
    { header: "Curso",       key: "course_id",   width: 16 },
    { header: "Video ID",    key: "video_id",    width: 16 },
    { header: "Pregunta",    key: "question",    width: 48 },
    { header: "Respuesta",   key: "answer",      width: 48 },
    { header: "Correcto",    key: "is_correct",  width: 12 },
    { header: "Feedback IA", key: "ai_feedback", width: 55 },
    { header: "Fecha",       key: "created_at",  width: 22 },
  ];

  // Estilo de encabezado
  sheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E40AF" } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
  });
  sheet.getRow(1).height = 20;

  for (const a of answers) {
    sheet.addRow({
      user_name:   a.user_name  ?? "—",
      user_email:  a.user_email ?? "—",
      course_id:   a.course_id,
      video_id:    a.video_id,
      question:    a.question,
      answer:      a.answer,
      is_correct:  a.is_correct === true ? "Correcto" : a.is_correct === false ? "Incorrecto" : "—",
      ai_feedback: a.ai_feedback ?? "",
      created_at:  new Date(a.created_at).toLocaleString("es-MX"),
    });
  }

  // Zebra striping
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const bg = rowNumber % 2 === 0 ? "FFF1F5F9" : "FFFFFFFF";
    row.eachCell((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bg } };
      cell.alignment = { wrapText: true, vertical: "top" };
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="respuestas-${Date.now()}.xlsx"`,
    },
  });
}