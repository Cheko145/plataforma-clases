import { google } from '@ai-sdk/google';

import { generateText, convertToModelMessages, streamText, tool, zodSchema } from 'ai'; // Usamos convertToCoreMessages (estándar actual)
import { YouTubeService } from '@/infrastructure/youtube.service';

// Configuración para Vercel (Edge o Node)
export const maxDuration = 30;

export async function POST(req: Request) {

  // 1. Extraemos mensajes y videoId
const { messages, id, videoId } = await req.json();  console.log("📨 Mensajes recibidos:", videoId);
  // Validación de seguridad: Si no hay ID, no podemos trabajar
  if (!videoId) {
    return new Response('Video ID is required', { status: 400 });
  }
  const targetYoutubeId = videoId;
  let transcript = '';

  try {
    transcript = await YouTubeService.getTranscript(targetYoutubeId);
    console.log("✅ Transcripción obtenida. Longitud:", transcript.length);
  } catch (error) {
    console.error("❌ Error obteniendo transcripción:", error);
    transcript = "No se pudo obtener la transcripción del video.";
  }

  const result = streamText({
    
    model: google('gemini-3-flash-preview'),    
    system: `
      Eres un profesor asistente experto.
      
      --- INSTRUCCIÓN ESPECIAL PARA PREGUNTAS AUTOMÁTICAS ---
      Si recibes un mensaje que empieza con "TRIGGER_AUTO_QUESTION:", significa que es el momento de evaluar al alumno.
      El mensaje vendrá con el formato: 'User: "NOMBRE", Question: "TEXTO"'.
      
      TU TAREA EN ESE CASO:
      Ignora el saludo habitual y responde EXCLUSIVAMENTE con este formato:
      "Hola [NOMBRE], me puedes responder esta pregunta: [TEXTO]?"
      
      No añadas nada más, solo lanza la pregunta amablemente.
      
      --- FIN INSTRUCCIÓN ---

      Para el resto de mensajes normales, responde dudas basándote en la transcripción:
      ${transcript}
      REGLAS ESTRICTAS:
      1. Responde preguntas SOLO basándote en la transcripción proporcionada arriba.
      2. Si la respuesta no está en el video, di: "Lo siento, ese tema no se tocó en este video".
      3. Sé conciso y didáctico.
      4. Responde en el mismo idioma en que se pregunta.
    `,
    messages: await convertToModelMessages(messages),
  });
  return result.toUIMessageStreamResponse();
}