import { YoutubeTranscript } from 'youtube-transcript-plus';
import { HttpsProxyAgent } from 'https-proxy-agent';

export class YouTubeService {
  /**
   * Obtiene la transcripción simple de un video de YouTube
   * @param videoId El ID del video o la URL completa
   */
  static async getTranscript(videoId: string): Promise<string> {
    try {
      console.log(`fetching transcript for: ${videoId}`);
      const proxyUrl = process.env.PROXY_URL;
      // La librería acepta tanto el ID como la URL completa
      const agent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;
      const transcriptConfig = await YoutubeTranscript.fetchTranscript(videoId, {
        lang: 'es', 
        // @ts-ignore - Forzamos la configuración del agente en el cliente HTTP interno
        config: {
          httpOptions: {
            agent: agent,
            timeout: 10000 // 10 segundos para no agotar el tiempo de Vercel
          },
          headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'es-ES,es;q=0.9',
      }
        }
      });
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