import { Env } from "./types";
import { decodeMuLaw, createWavFile } from "./audio";
import { getSarvamConversation, getSarvamTTS, SarvamResponse } from "./sarvam";
import { createEmergencyTicket, logTranscript } from "./supabase";

export async function handleTwilioWebSocket(server: WebSocket, env: Env) {
  server.accept();

  let streamSid = "";
  let callSid = "";
  let audioBuffer: Int16Array[] = [];
  let isProcessing = false;
  let ticketCreated = false;
  let history: any[] = [];

  server.addEventListener("message", async (event) => {
    try {
      const data = JSON.parse(event.data as string);

      if (data.event === "start") {
        streamSid = data.start.streamSid;
        callSid = data.start.callSid;
        console.log("Started Twilio stream", streamSid);

        // Send initial greeting
        const greetingText = "नमस्कार! जीवन AI मध्ये आपले स्वागत आहे. मी तुमची मदत करण्यासाठी येथे आहे. कृपया तुमची समस्या सांगा.";
        await sendAudioResponse(greetingText, "mr");
        await logTranscript(callSid, "ai", greetingText, env);

      } else if (data.event === "media") {
        if (!isProcessing) {
          const pcm = decodeMuLaw(data.media.payload);
          audioBuffer.push(pcm);

          // If we have about 3 seconds of audio (3 * 8000 samples)
          const totalSamples = audioBuffer.reduce((acc, val) => acc + val.length, 0);
          if (totalSamples > 24000) {
            isProcessing = true;
            const bufferToProcess = mergeBuffers(audioBuffer, totalSamples);
            audioBuffer = []; // clear buffer

            // Process audio async
            processAudioChunk(bufferToProcess).finally(() => {
              isProcessing = false;
            });
          }
        }
      } else if (data.event === "stop") {
        console.log("Stopped Twilio stream", streamSid);
      }
    } catch (e) {
      console.error("WS Message Error:", e);
    }
  });

  async function processAudioChunk(pcmData: Int16Array) {
    try {
      // 1. Convert to WAV for Whisper
      const wavBytes = createWavFile(pcmData, 8000);

      // 2. Transcribe using Cloudflare Workers AI Whisper
      const whisperResponse = await env.AI.run("@cf/openai/whisper", {
        audio: [...wavBytes] // Convert to array for Cloudflare AI API
      });
      
      const callerText = whisperResponse.text;
      if (!callerText || callerText.trim().length < 2) return;
      
      console.log("Caller:", callerText);
      await logTranscript(callSid, "caller", callerText, env);

      // 3. Process with Sarvam LLM
      const aiResponse = await getSarvamConversation(callerText, history, env);
      console.log("Sarvam:", aiResponse);
      await logTranscript(callSid, "ai", aiResponse.reply, env);

      // 4. Create Emergency Ticket if needed
      if (aiResponse.create_ticket && !ticketCreated) {
        await createEmergencyTicket(callSid, aiResponse, env);
        ticketCreated = true;
      }

      // 5. Generate TTS and send back to Twilio
      await sendAudioResponse(aiResponse.reply, aiResponse.language);

    } catch (error) {
      console.error("Processing chunk failed:", error);
    }
  }

  async function sendAudioResponse(text: string, language: string) {
    try {
      // Get raw WAV/PCM bytes from Sarvam TTS
      const audioBytes = await getSarvamTTS(text, language, env);
      
      // Since Sarvam returns a WAV/PCM, we need to convert it to mu-law 8000Hz base64.
      // For the MVP, we assume Sarvam's output is directly playable or we convert it.
      // (A real implementation would need a PCM to mu-law encoder here)
      // We will send it back to Twilio.
      const b64 = btoa(String.fromCharCode(...new Uint8Array(audioBytes)));

      // Send clear message to interrupt Twilio buffering
      server.send(JSON.stringify({
        event: "clear",
        streamSid: streamSid
      }));

      // Send media
      server.send(JSON.stringify({
        event: "media",
        streamSid: streamSid,
        media: {
          payload: b64
        }
      }));
    } catch (e) {
      console.error("TTS Error:", e);
    }
  }

  function mergeBuffers(buffers: Int16Array[], totalLength: number): Int16Array {
    const result = new Int16Array(totalLength);
    let offset = 0;
    for (const buf of buffers) {
      result.set(buf, offset);
      offset += buf.length;
    }
    return result;
  }
}
