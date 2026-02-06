import { YoutubeTranscript } from 'youtube-transcript-plus';

export class YouTubeService {
  /**
   * Obtiene la transcripción simple de un video de YouTube
   * @param videoId El ID del video o la URL completa
   */
  static async getTranscript(videoId: string): Promise<string> {
    try {
      console.log(`fetching transcript for: ${videoId}`);
      
      // La librería acepta tanto el ID como la URL completa
      const transcriptConfig = await YoutubeTranscript.fetchTranscript(videoId, {
        lang: 'es', // Opcional: intentar forzar español
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