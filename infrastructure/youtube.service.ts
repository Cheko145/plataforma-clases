const RE_XML_TRANSCRIPT = /<text start="([^"]*)" dur="([^"]*)">([^<]*)<\/text>/g;

/**
 * Llama directamente al Innertube player API sin pasar por la página de YouTube.
 * Esto evita el bloqueo GDPR/consent que YouTube aplica a IPs de data centers.
 */
async function fetchTranscriptDirect(
  videoId: string,
  lang = "es"
): Promise<string> {
  // 1) Llamar al Innertube player endpoint como cliente WEB
  const playerRes = await fetch(
    "https://www.youtube.com/youtubei/v1/player?prettyPrint=false",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        context: {
          client: {
            clientName: "WEB",
            clientVersion: "2.20250101.00.00",
          },
        },
        videoId,
      }),
    }
  );

  if (!playerRes.ok) {
    throw new Error(`Innertube player responded ${playerRes.status}`);
  }

  const playerJson = await playerRes.json();
  const tracklist =
    playerJson?.captions?.playerCaptionsTracklistRenderer;
  const tracks: { languageCode: string; baseUrl?: string; url?: string }[] =
    tracklist?.captionTracks ?? [];

  if (!tracks.length) {
    throw new Error("No caption tracks found");
  }

  // 2) Elegir el track del idioma solicitado o el primero disponible
  const track =
    tracks.find((t) => t.languageCode === lang) ?? tracks[0];

  const transcriptURL = track.baseUrl ?? track.url;
  if (!transcriptURL) {
    throw new Error("No transcript URL in caption track");
  }

  // 3) Descargar el XML de la transcripción
  const transcriptRes = await fetch(transcriptURL);
  if (!transcriptRes.ok) {
    throw new Error(`Transcript fetch responded ${transcriptRes.status}`);
  }

  const xml = await transcriptRes.text();

  // 4) Parsear el XML a texto plano
  const segments: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = RE_XML_TRANSCRIPT.exec(xml)) !== null) {
    segments.push(match[3]);
  }

  if (!segments.length) {
    throw new Error("Transcript XML had no text segments");
  }

  return segments
    .join(" ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export class YouTubeService {
  /**
   * Obtiene la transcripción simple de un video de YouTube
   * @param videoId El ID del video o la URL completa
   */
  static async getTranscript(videoId: string): Promise<string> {
    // Extraer el ID si viene una URL completa
    const idMatch = videoId.match(
      /(?:v=|\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    const id = idMatch ? idMatch[1] : videoId;

    try {
      console.log(`fetching transcript for: ${id}`);
      return await fetchTranscriptDirect(id);
    } catch (error) {
      console.error("❌ Error al obtener transcripción:", error);
      return "";
    }
  }
}