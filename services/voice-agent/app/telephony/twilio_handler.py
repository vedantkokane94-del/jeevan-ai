"""
JEEVAN AI — Twilio Media Streams Handler

Bridges Twilio PSTN calls with the AI conversation engine.
Handles bidirectional audio streaming, format conversion, and silence detection.
"""

import asyncio
import base64
import json
import logging
from io import BytesIO

from fastapi import WebSocket, WebSocketDisconnect
from pydub import AudioSegment

from app.engine.brain import ai_brain
from app.engine.stt import stt_engine
from app.engine.tts import tts_engine
from app.telephony.call_manager import call_manager

logger = logging.getLogger(__name__)


class TwilioStreamHandler:
    """Handles a single Twilio Media Stream WebSocket connection."""

    def __init__(self, websocket: WebSocket):
        self.websocket = websocket
        self.stream_sid = None
        self.call_sid = None
        self.ctx = None
        
        # Audio buffering for STT
        self.audio_buffer = []
        self.is_processing = False
        
        # Background task for playing TTS
        self.tts_task = None

    async def _convert_mulaw_to_pcm16(self, mulaw_b64: str) -> bytes:
        """Convert Twilio base64 mulaw to 16kHz PCM bytes for Whisper."""
        try:
            raw_mulaw = base64.b64decode(mulaw_b64)
            # Load raw mulaw into pydub (8000Hz, 1 channel, 1 byte width)
            audio = AudioSegment(
                data=raw_mulaw,
                sample_width=1,
                frame_rate=8000,
                channels=1
            )
            # Export to 16kHz PCM (2 byte width)
            audio = audio.set_frame_rate(16000).set_sample_width(2)
            return audio.raw_data
        except Exception as e:
            logger.error(f"Audio conversion error: {e}")
            return b""

    async def _convert_mp3_to_mulaw(self, mp3_bytes: bytes) -> str:
        """Convert Edge TTS MP3 to Twilio base64 mulaw."""
        try:
            # Load mp3 into pydub
            audio = AudioSegment.from_mp3(BytesIO(mp3_bytes))
            # Export to 8kHz mulaw
            audio = audio.set_frame_rate(8000).set_channels(1).set_sample_width(1)
            
            out_f = BytesIO()
            # We must export as raw headerless for Twilio (audioop/ulaw format)
            # pydub doesn't natively do pure raw ulaw without headers easily unless we use ffmpeg params
            audio.export(out_f, format="raw", codec="pcm_mulaw")
            
            return base64.b64encode(out_f.getvalue()).decode("utf-8")
        except Exception as e:
            logger.error(f"TTS conversion error: {e}")
            return ""

    async def handle(self):
        """Main WebSocket loop for Twilio."""
        await self.websocket.accept()
        logger.info("Twilio WebSocket connected")

        try:
            while True:
                message = await self.websocket.receive_text()
                data = json.loads(message)

                event_type = data.get("event")

                if event_type == "start":
                    self.stream_sid = data["start"]["streamSid"]
                    self.call_sid = data["start"]["callSid"]
                    logger.info(f"Twilio stream started: {self.stream_sid}")
                    
                    # Initialize conversation session
                    self.ctx = await call_manager.start_call(caller_number=self.call_sid)
                    
                    # Trigger greeting
                    asyncio.create_task(self._process_initial_greeting())

                elif event_type == "media":
                    # Buffer audio
                    if not self.is_processing:
                        chunk_b64 = data["media"]["payload"]
                        pcm_bytes = await self._convert_mulaw_to_pcm16(chunk_b64)
                        if pcm_bytes:
                            self.audio_buffer.append(pcm_bytes)
                            
                    # Simple VAD / chunking trigger: if we have 3 seconds of audio
                    # In a production app, use PyRTC VAD or WebRTC VAD here.
                    if len(self.audio_buffer) > 150:  # ~3 seconds at 20ms per chunk
                        asyncio.create_task(self._process_audio_buffer())

                elif event_type == "stop":
                    logger.info(f"Twilio stream stopped: {self.stream_sid}")
                    break

        except WebSocketDisconnect:
            logger.info("Twilio WebSocket disconnected by client")
        except Exception as e:
            logger.error(f"Twilio handler error: {e}")
        finally:
            if self.ctx:
                await call_manager.end_call(self.ctx.session_id)

    async def _process_initial_greeting(self):
        """Send greeting to caller."""
        if not self.ctx:
            return
            
        self.is_processing = True
        try:
            greeting = ai_brain.get_greeting(self.ctx.session_id, self.ctx.language)
            # Add a consent prompt naturally
            consent = (
                "ही कॉल तुमच्या सुरक्षिततेसाठी रेकॉर्ड केली जात आहे." if self.ctx.language == "mr"
                else "यह कॉल आपकी सुरक्षा के लिए रिकॉर्ड की जा रही है।" if self.ctx.language == "hi"
                else "This call is being recorded for your safety."
            )
            full_text = greeting.text + " " + consent
            
            await self._synthesize_and_send(full_text, greeting.language)
        finally:
            self.is_processing = False

    async def _process_audio_buffer(self):
        """Transcribe buffered audio and run conversation logic."""
        if self.is_processing or not self.audio_buffer:
            return
            
        self.is_processing = True
        audio_to_process = b"".join(self.audio_buffer)
        self.audio_buffer.clear()
        
        try:
            # 1. Transcribe
            stt_result = await stt_engine.transcribe_audio(
                audio_to_process, 
                language_hint=self.ctx.language if self.ctx.language != "en" else None
            )
            
            caller_text = stt_result.text
            if not caller_text.strip():
                # Ignore noise/silence
                return
                
            logger.info(f"Twilio Caller: {caller_text}")
            
            # 2. Run NLU & State Machine via Gemini
            response = await ai_brain.process_input(self.ctx.session_id, caller_text)
            
            # 3. Create ticket if needed
            if response.should_create_ticket and response.ticket_data:
                await call_manager.create_incident_ticket(self.ctx, response.ticket_data)
                
            # Broadcast to Command Center
            await call_manager.broadcast_call_update(self.ctx)
            
            # 4. Speak response
            await self._synthesize_and_send(response.text, response.language)
            
        except Exception as e:
            logger.error(f"Error processing audio buffer: {e}")
        finally:
            self.is_processing = False

    async def _synthesize_and_send(self, text: str, language: str):
        """Generate TTS and send it back to Twilio as mulaw."""
        logger.info(f"Twilio Agent: {text}")
        try:
            tts_result = await tts_engine.synthesize(text, language)
            mulaw_b64 = await self._convert_mp3_to_mulaw(tts_result.audio_data)
            
            if mulaw_b64 and self.stream_sid:
                # Send clear message to interrupt Twilio buffering if needed
                await self.websocket.send_json({
                    "event": "clear",
                    "streamSid": self.stream_sid
                })
                
                # Send media
                await self.websocket.send_json({
                    "event": "media",
                    "streamSid": self.stream_sid,
                    "media": {
                        "payload": mulaw_b64
                    }
                })
        except Exception as e:
            logger.error(f"Failed to send TTS to Twilio: {e}")
