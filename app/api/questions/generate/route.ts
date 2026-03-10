import { auth } from "@/auth";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { saveVideoQuestions, type QuestionWithTime } from "@/lib/questions";
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

Para cada pregunta determina el segundo exacto del video en que el alumno YA habrá visto el contenido necesario para responderla. La pregunta debe aparecer DESPUÉS de ese momento, no antes.

Las preguntas deben:
- Evaluar comprensión conceptual del contenido del video
- Ser claras y concisas
- No repetirse ni ser similares entre sí
- Estar ordenadas cronológicamente por su trigger_time

Responde ÚNICAMENTE con un objeto JSON válido, sin markdown ni texto adicional:
{"questions": [{"question": "pregunta 1", "trigger_time": 60}, {"question": "pregunta 2", "trigger_time": 120}, {"question": "pregunta 3", "trigger_time": 180}, {"question": "pregunta 4", "trigger_time": 240}]}

Donde trigger_time es el número de segundos desde el inicio del video.`,
        },
      ],
    },
  ];

  const { text } = await generateText({
    model: google("gemini-3-flash-preview"),
    messages: videoContext,
  });

  let questions: QuestionWithTime[];
  try {
    // Limpia posible markdown que Gemini a veces añade
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    questions = parsed.questions;
    if (!Array.isArray(questions) || questions.length === 0) throw new Error();
    // Valida estructura
    if (!questions.every(q => typeof q.question === "string" && typeof q.trigger_time === "number")) {
      throw new Error("Estructura inválida");
    }
    // Ordena por trigger_time por si acaso
    questions.sort((a, b) => a.trigger_time - b.trigger_time);
  } catch {
    return new Response("Error al parsear respuesta de IA", { status: 500 });
  }

  await saveVideoQuestions(videoId, questions);
  return Response.json({ success: true, questions });
}
