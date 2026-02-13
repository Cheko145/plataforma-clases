const RE_XML_TRANSCRIPT = /<text start="([^"]*)" dur="([^"]*)">([^<]*)<\/text>/g;

/**
 * Codifica los params protobuf para el endpoint get_transcript.
 * Estructura: message { message { string video_id = 1 } = 1 }
 */
function encodeTranscriptParams(videoId: string): string {
  const idBytes = new TextEncoder().encode(videoId);
  // Inner message: field 1, wire type 2 (length-delimited)
  const inner = new Uint8Array(2 + idBytes.length);
  inner[0] = 0x0a; // field 1, wire type 2
  inner[1] = idBytes.length;
  inner.set(idBytes, 2);
  // Outer message: field 1, wire type 2
  const outer = new Uint8Array(2 + inner.length);
  outer[0] = 0x0a;
  outer[1] = inner.length;
  outer.set(inner, 2);

  // Base64url encode
  let binary = "";
  for (const byte of outer) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Usa el endpoint get_transcript de Innertube para obtener la transcripción.
 * Este endpoint es específico para transcripciones y funciona desde IPs de data centers.
 */
async function fetchViaGetTranscript(videoId: string): Promise<string> {
  const params = encodeTranscriptParams(videoId);

  const res = await fetch(
    "https://www.youtube.com/youtubei/v1/get_transcript?prettyPrint=false",
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
        params,
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`get_transcript responded ${res.status}`);
  }

  const json = await res.json();

  const body =
    json?.actions?.[0]?.updateEngagementPanelAction?.content
      ?.transcriptRenderer?.body?.transcriptBodyRenderer;

  if (!body) {
    throw new Error("No transcript body in get_transcript response");
  }

  const cueGroups: { transcriptCueGroupRenderer?: { cues?: { transcriptCueRenderer?: { cue?: { simpleText?: string; runs?: { text: string }[] } } }[] } }[] =
    body.cueGroups ?? [];

  if (!cueGroups.length) {
    throw new Error("No cue groups found in transcript");
  }

  const segments: string[] = [];
  for (const group of cueGroups) {
    const cues = group.transcriptCueGroupRenderer?.cues ?? [];
    for (const cue of cues) {
      const renderer = cue.transcriptCueRenderer;
      if (!renderer) continue;
      const text =
        renderer.cue?.simpleText ??
        renderer.cue?.runs?.map((r) => r.text).join("") ??
        "";
      if (text) segments.push(text);
    }
  }

  if (!segments.length) {
    throw new Error("Transcript had no text segments");
  }

  return segments
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Fallback: Innertube player API con cliente ANDROID (devuelve caption tracks
 * con más frecuencia que WEB).
 */
async function fetchViaPlayer(videoId: string, lang = "es"): Promise<string> {
  const playerRes = await fetch(
    "https://www.youtube.com/youtubei/v1/player?prettyPrint=false",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        context: {
          client: {
            clientName: "ANDROID",
            clientVersion: "19.29.37",
            androidSdkVersion: 30,
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
  const tracks: { languageCode: string; baseUrl?: string; url?: string }[] =
    playerJson?.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? [];

  if (!tracks.length) {
    throw new Error("No caption tracks found (ANDROID)");
  }

  const track = tracks.find((t) => t.languageCode === lang) ?? tracks[0];
  const transcriptURL = track.baseUrl ?? track.url;
  if (!transcriptURL) throw new Error("No transcript URL");

  const transcriptRes = await fetch(transcriptURL);
  if (!transcriptRes.ok) {
    throw new Error(`Transcript fetch responded ${transcriptRes.status}`);
  }

  const xml = await transcriptRes.text();
  const segments: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = RE_XML_TRANSCRIPT.exec(xml)) !== null) {
    segments.push(match[3]);
  }

  if (!segments.length) throw new Error("Transcript XML had no text segments");

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
   * Obtiene la transcripción de un video de YouTube.
   * Intenta get_transcript primero, luego player ANDROID como fallback.
   */
  static async getTranscript(videoId: string): Promise<string> {
    const idMatch = videoId.match(
      /(?:v=|\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    const id = idMatch ? idMatch[1] : videoId;

    console.log(`fetching transcript for: ${id}`);

    // Intento 1: get_transcript endpoint
    try {
      return await fetchViaGetTranscript(id);
    } catch (err) {
      console.warn("get_transcript falló, intentando player ANDROID:", err);
    }

    // Intento 2: player API con ANDROID client
    try {
      return await fetchViaPlayer(id);
    } catch (err) {
      console.error("❌ Error al obtener transcripción:", err);
    }

    return "";
  }
}
