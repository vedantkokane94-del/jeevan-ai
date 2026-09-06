import { Env } from "./types";

export interface SarvamResponse {
  reply: string;
  language: string;
  emergency_type: string | null;
  severity: string | null;
  landmark: string | null;
  zone_id: string | null;
  create_ticket: boolean;
}

const SARVAM_BASE_URL = "https://api.sarvam.ai";

/**
 * Uses Sarvam AI LLM for Marathi/Hindi natural language understanding.
 */
export async function getSarvamConversation(
  transcript: string, 
  history: any[], 
  env: Env
): Promise<SarvamResponse> {
  const prompt = `
You are a highly trained, calm Emergency Volunteer for JEEVAN AI at Nashik Kumbh Mela 2027.
The caller says: "${transcript}"

Extract the following in JSON format:
- reply: A short, calm, helpful response in Marathi or Hindi (match the caller's language). Never diagnose. Provide basic first aid if applicable.
- language: "hi" or "mr"
- emergency_type: e.g. MEDICAL_EMERGENCY, DROWNING, CROWD_CRUSH, or null
- severity: CRITICAL, HIGH, MEDIUM, LOW, or null
- landmark: e.g. Ramkund, Panchavati, or null
- zone_id: Map landmark to ZONE_A, ZONE_B, etc., or null
- create_ticket: true if you have enough info to dispatch help.

Output strictly valid JSON only.
`;

  // We use standard OpenAI-compatible completions format as a wrapper, 
  // or Sarvam's native completion API if available.
  const response = await fetch(`${SARVAM_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${env.SARVAM_API_KEY}`
    },
    body: JSON.stringify({
      model: "sarvam-1", // Placeholder for Sarvam's actual conversational model
      messages: [
        { role: "system", content: prompt }
      ],
      temperature: 0.3
    })
  });

  if (!response.ok) {
    throw new Error(`Sarvam LLM failed: ${response.statusText}`);
  }

  const data = await response.json() as any;
  const content = data.choices?.[0]?.message?.content || "{}";
  
  try {
    return JSON.parse(content) as SarvamResponse;
  } catch (e) {
    // Fallback if JSON parse fails
    return {
      reply: "मी तुमची मदत करत आहे. (I am helping you.)",
      language: "mr",
      emergency_type: null,
      severity: null,
      landmark: null,
      zone_id: null,
      create_ticket: false
    };
  }
}

/**
 * Uses Sarvam AI Voice for natural Indic Text-to-Speech
 */
export async function getSarvamTTS(
  text: string, 
  language: string, 
  env: Env
): Promise<Uint8Array> {
  // Sarvam's TTS endpoint
  const response = await fetch(`${SARVAM_BASE_URL}/text-to-speech`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "API-Subscription-Key": env.SARVAM_API_KEY
    },
    body: JSON.stringify({
      inputs: [text],
      target_language_code: language === "mr" ? "mr-IN" : "hi-IN",
      speaker: "meera", // Assuming standard Sarvam voice name
      pitch: 0,
      pace: 1.0,
      loudness: 1.5,
      speech_sample_rate: 8000,
      enable_preprocessing: true,
      model: "tts-indic-v0.1"
    })
  });

  if (!response.ok) {
    throw new Error(`Sarvam TTS failed: ${response.statusText}`);
  }

  const data = await response.json() as any;
  // Sarvam returns base64 audio
  const audioB64 = data.audios[0];
  const binaryString = atob(audioB64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  return bytes;
}
