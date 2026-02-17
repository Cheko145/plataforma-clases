// app/api/chat/route.ts
import { google } from '@ai-sdk/google';
import { convertToModelMessages, streamText } from 'ai';
import type { ModelMessage } from '@ai-sdk/provider-utils';
import { saveStudentAnswer } from '@/lib/answers';
import { auth } from '@/auth';

export const maxDuration = 60;

export async function POST(req: Request) {
  // Autenticación: el userId siempre viene de la sesión del servidor, nunca del cliente
  const session = await auth();
  if (!session?.user?.id) {
    return new Response('No autorizado', { status: 401 });
  }
  const userId = session.user.id;

  const { messages, videoId, isStudentAnswer, pendingQuestion, courseId } = await req.json();

  if (!videoId) {
    return new Response('Video ID is required', { status: 400 });
  }

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  // System prompt base
  let systemPrompt = `
    Eres un profesor asistente experto.

    --- INSTRUCCIÓN ESPECIAL PARA PREGUNTAS AUTOMÁTICAS ---
    Si recibes un mensaje que empieza con "TRIGGER_AUTO_QUESTION:", significa que es el momento de evaluar al alumno.
    El mensaje vendrá con el formato: 'User: "NOMBRE", Question: "TEXTO"'.

    TU TAREA EN ESE CASO:
    Ignora el saludo habitual y responde EXCLUSIVAMENTE con este formato:
    "Hola [NOMBRE], me puedes responder esta pregunta: [TEXTO]?"

    No añadas nada más, solo lanza la pregunta amablemente.

    --- FIN INSTRUCCIÓN ---

    Para el resto de mensajes normales, responde dudas basándote en el contenido del video de YouTube proporcionado.
    REGLAS ESTRICTAS:
    1. Responde preguntas SOLO basándose en el contenido del video proporcionado.
    2. Si la respuesta no está en el video, di: "Lo siento, ese tema no se tocó en este video".
    3. Sé conciso y didáctico.
    4. Responde en el mismo idioma en que se pregunta.
  `;

  // Si es respuesta a una pregunta automática, instruimos al AI para evaluar
  if (isStudentAnswer && pendingQuestion) {
    systemPrompt = `
    Eres un profesor evaluador. El alumno acaba de responder la siguiente pregunta de evaluación:

    PREGUNTA: "${pendingQuestion}"

    Usa el contenido del video de YouTube proporcionado para verificar la respuesta correcta.

    INSTRUCCIONES:
    1. Evalúa si la respuesta del alumno es correcta según el video.
    2. Sé amable y constructivo.
    3. Explica brevemente si está correcto o no y por qué.
    4. Si está incorrecto, da la respuesta correcta.
    5. Al FINAL de tu respuesta (en una nueva línea), incluye EXACTAMENTE una de estas etiquetas: [EVAL:SI] o [EVAL:NO] según sea correcto o no. No la menciones en el cuerpo del texto.
    `;
  }

  // Gemini procesa el video de YouTube directamente (sin scraping de transcripción)
  const videoContext: ModelMessage[] = [
    {
      role: 'user',
      content: [
        {
          type: 'file',
          data: new URL(videoUrl),
          mediaType: 'video/mp4',
        },
        {
          type: 'text',
          text: 'Este es el video del curso. Úsalo como referencia para responder todas las preguntas.',
        },
      ],
    },
    {
      role: 'assistant',
      content: [{ type: 'text', text: 'Entendido, he analizado el video del curso. ¿En qué puedo ayudarte?' }],
    },
  ];

  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: google('gemini-3-flash-preview'),
    system: systemPrompt,
    messages: [...videoContext, ...modelMessages],
    onFinish: async ({ text }) => {
      if (isStudentAnswer && pendingQuestion && courseId) {
        const isCorrect = text.includes('[EVAL:SI]') ? true : text.includes('[EVAL:NO]') ? false : null;
        const cleanFeedback = text.replace(/\[EVAL:(SI|NO)\]/g, '').trim();

        const lastUserMessage = [...messages].reverse().find((m: { role: string }) => m.role === 'user');
        const studentAnswer = lastUserMessage?.parts?.[0]?.text ?? lastUserMessage?.content ?? '';

        try {
          await saveStudentAnswer({
            userId,
            courseId,
            videoId,
            question: pendingQuestion,
            answer: studentAnswer,
            isCorrect,
            aiFeedback: cleanFeedback,
          });
        } catch (err) {
          console.error('[chat] Error guardando respuesta:', err);
        }
      }
    },
  });

  return result.toUIMessageStreamResponse();
}
