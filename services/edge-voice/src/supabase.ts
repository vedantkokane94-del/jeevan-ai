import { createClient } from "@supabase/supabase-js";
import { Env } from "./types";
import { SarvamResponse } from "./sarvam";

export async function createEmergencyTicket(
  callId: string, 
  response: SarvamResponse, 
  env: Env
) {
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = await supabase
    .from("emergency_calls")
    .insert([
      {
        id: callId, // Using Twilio CallSid as ID
        status: "ACTIVE",
        language: response.language,
        emergency_type: response.emergency_type,
        severity: response.severity,
        landmark: response.landmark,
        zone_id: response.zone_id,
        ai_summary: response.reply,
        created_at: new Date().toISOString()
      }
    ]);

  if (error) {
    console.error("Supabase insert error:", error);
  }
  
  return data;
}

export async function logTranscript(
  callId: string,
  role: "caller" | "ai",
  text: string,
  env: Env
) {
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  const { error } = await supabase
    .from("call_transcripts")
    .insert([
      {
        call_id: callId,
        role: role,
        text: text,
        created_at: new Date().toISOString()
      }
    ]);

  if (error) {
    console.error("Supabase transcript log error:", error);
  }
}
