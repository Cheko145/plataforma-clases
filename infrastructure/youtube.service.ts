import { YoutubeTranscript } from 'youtube-transcript-plus';
import type { FetchParams, TranscriptConfig } from 'youtube-transcript-plus/dist/types';

const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

/**
 * Fetch personalizado que inyecta cookies de consentimiento y headers
 * para evitar que YouTube devuelva la página GDPR/consent desde IPs de data center.
 */
async function ytFetch(params: FetchParams): Promise<Response> {
  const { url, lang, userAgent, method = 'GET', body, headers = {} } = params;
  return fetch(url, {
    method,
    body: method === 'POST' ? body : undefined,
    headers: {
      'User-Agent': userAgent || BROWSER_UA,
      ...(lang && { 'Accept-Language': lang }),
      // Cookie de consentimiento para evitar la pantalla GDPR
      Cookie: 'CONSENT=PENDING+987; SOCS=CAESEwgDEgk3NDE3MTI5MTcaAmVuIAEaBgiA_LyuBg',
      ...headers,
    },
  });
}

export class YouTubeService {
  /**
   * Obtiene la transcripción simple de un video de YouTube
   * @param videoId El ID del video o la URL completa
   */
  static async getTranscript(videoId: string): Promise<string> {
    try {
      console.log(`fetching transcript for: ${videoId}`);

      const config: TranscriptConfig = {
        lang: 'es',
        userAgent: BROWSER_UA,
        videoFetch: ytFetch,
        playerFetch: ytFetch,
        transcriptFetch: ytFetch,
      };

      const transcriptConfig = await YoutubeTranscript.fetchTranscript(videoId, config);

      // Unimos todos los fragmentos de texto
      const fullText = transcriptConfig
        .map((entry) => entry.text)
        .join(' ')
        .replace(/&amp;#39;/g, "'") // Limpieza básica de caracteres HTML
        .replace(/\s+/g, ' ')
        .trim();

      return fullText;

    } catch (error) {
      console.error("❌ Error al obtener transcripción simple:", error);
      // Retornamos vacío si no hay subtítulos disponibles
      return "";
    }
  }
}