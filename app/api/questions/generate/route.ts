import { auth } from "@/auth";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { saveVideoQuestions } from "@/lib/questions";
import { getCourseById } from "@/lib/courses-db";
import type { ModelMessage } from "@ai-sdk/provider-utils";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return new Response("No autorizado", { status: 401 });
  }

  const { videoId } = await req.json();
  if (!videoId) {
    return new Response("videoId requerido", { status: 400 });
  }

  const course = await getCourseById(videoId);
  if (!course) {
    return new Response("Curso no encontrado", { status: 404 });
  }

  const videoContext: ModelMessage[] = [
    {
      role: "user",
      content: [
        {
          type: "file",
          data: new URL(course.youtube_url),
          mediaType: "video/mp4",
        },
        {
          type: "text",
          text: `Analiza este video y genera exactamente 4 preguntas de evaluación en español.

Las preguntas deben:
- Evaluar comprensión conceptual del contenido del video
- Ser claras y concisas
- No repetirse ni ser similares entre sí
- Estar ordenadas de menor a mayor dificultad

Responde ÚNICAMENTE con un objeto JSON válido, sin markdown ni texto adicional:
{"questions": ["pregunta 1", "pregunta 2", "pregunta 3", "pregunta 4"]}`,
        },
      ],
    },
  ];

  const { text } = await generateText({
    model: google("gemini-2.0-flash"),
    messages: videoContext,
  });

  let questions: string[];
  try {
    // Limpia posible markdown que Gemini a veces añade
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    questions = parsed.questions;
    if (!Array.isArray(questions) || questions.length === 0) throw new Error();
  } catch {
    return new Response("Error al parsear respuesta de IA", { status: 500 });
  }

  await saveVideoQuestions(videoId, questions);
  return Response.json({ success: true, questions });
}
