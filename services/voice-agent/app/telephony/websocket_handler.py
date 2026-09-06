"""
JEEVAN AI — WebSocket Voice Call Handler

Handles bidirectional audio/text streaming between the caller
(browser WebRTC or telephony adapter) and the AI conversation engine.

Protocol:
- Client sends JSON messages with audio data (base64) or text
- Server responds with JSON containing TTS audio (base64) and metadata
"""

import asyncio
import base64
import json
import logging
import time
from typing import Any

from fastapi import WebSocket, WebSocketDisconnect
from app.engine.brain import ai_brain
from app.engine.stt import stt_engine
from app.engine.tts import tts_engine
from app.telephony.call_manager import call_manager

logger = logging.getLogger(__name__)


class WebSocketCallHandler:
    """
    Handles a single voice call over WebSocket.

    Message format (client → server):
    {
        "type": "audio" | "text" | "control",
        "data": "<base64 audio>" | "<text string>",
        "action": "start" | "end" | "mute" | "unmute"  (for control type)
    }

    Message format (server → client):
    {
        "type": "audio" | "text" | "status" | "ticket",
        "audio": "<base64 mp3>",
        "text": "<response text>",
        "state": "<current call state>",
        "language": "<detected language>",
        "emergency_type": "<detected type>",
        "ticket_id": "<ticket ID if created>",
        "metadata": {}
    }
    """

    async def handle_call(self, websocket: WebSocket):
        """Main handler for a voice call WebSocket connection."""
        await websocket.accept()

        # Start call session
        ctx = await call_manager.start_call()
        session_id = ctx.session_id

        logger.info(f"WS Call connected: {session_id}")

        try:
            # Send greeting
            greeting_response = ai_brain.get_greeting(session_id, ctx.language)
            consent = (
                "ही कॉल तुमच्या सुरक्षिततेसाठी रेकॉर्ड केली जात आहे." if ctx.language == "mr"
                else "यह कॉल आपकी सुरक्षा के लिए रिकॉर्ड की जा रही है।" if ctx.language == "hi"
                else "This call is being recorded for your safety."
            )
            full_greeting = greeting_response.text + " " + consent

            # Generate TTS for greeting
            tts_result = await tts_engine.synthesize(full_greeting, ctx.language)
            audio_b64 = base64.b64encode(tts_result.audio_data).decode("utf-8")

            await websocket.send_json({
                "type": "greeting",
                "text": full_greeting,
                "audio": audio_b64,
                "audio_format": "mp3",
                "state": ctx.state.value,
                "language": ctx.language,
                "session_id": session_id,
            })

            # Main conversation loop
            while True:
                try:
                    raw = await asyncio.wait_for(
                        websocket.receive_text(),
                        timeout=float(120)  # 2 min timeout for each message
                    )
                    message = json.loads(raw)
                except asyncio.TimeoutError:
                    break
                except (json.JSONDecodeError, WebSocketDisconnect):
                    break

                msg_type = message.get("type", "")

                if msg_type == "control":
                    action = message.get("action", "")
                    if action == "end":
                        break
                    continue

                elif msg_type == "audio":
                    # Decode base64 audio and transcribe
                    audio_b64_data = message.get("data", "")
                    if audio_b64_data:
                        audio_bytes = base64.b64decode(audio_b64_data)
                        stt_result = await stt_engine.transcribe_audio(
                            audio_bytes,
                            language_hint=ctx.language if ctx.language != "en" else None
                        )
                        caller_text = stt_result.text
                    else:
                        caller_text = ""

                elif msg_type == "text":
                    # Direct text input (for browser simulator)
                    caller_text = message.get("data", "")

                else:
                    continue

                if not caller_text.strip():
                    continue

                # Process through Gemini brain
                response = await ai_brain.process_input(session_id, caller_text)

                # Create ticket if needed
                if response.should_create_ticket and response.ticket_data:
                    ticket_id = await call_manager.create_incident_ticket(
                        ctx, response.ticket_data
                    )
                    ctx.ticket_created = True
                    ctx.incident_id = ticket_id

                # Broadcast update
                await call_manager.broadcast_call_update(ctx)

                # Send response
                await self._send_response(websocket, ctx, response)

        except WebSocketDisconnect:
            logger.info(f"WS Call disconnected: {session_id}")
        except Exception as e:
            logger.error(f"WS Call error: {session_id} — {e}")
        finally:
            # End call
            result = await call_manager.end_call(session_id)
            try:
                await websocket.send_json({
                    "type": "call_ended",
                    "session_id": session_id,
                    "summary": result,
                })
            except Exception:
                pass  # Connection may already be closed

    async def _send_response(
        self,
        websocket: WebSocket,
        ctx: ConversationContext,
        response,
    ):
        """Generate TTS and send response to the client."""
        try:
            # Generate TTS audio
            tts_result = await tts_engine.synthesize(response.text, response.language)
            audio_b64 = base64.b64encode(tts_result.audio_data).decode("utf-8")

            payload = {
                "type": "response",
                "text": response.text,
                "audio": audio_b64,
                "audio_format": "mp3",
                "state": ctx.state.value,
                "language": ctx.language,
                "emergency_type": ctx.emergency_type,
                "severity": ctx.emergency_severity,
                "landmark": ctx.landmark.landmark.name_en if ctx.landmark else None,
                "zone": ctx.zone_id,
                "ticket_id": ctx.incident_id,
                "ticket_created": ctx.ticket_created,
                "turn_count": len(ctx.turns),
                "duration_seconds": round(ctx.duration_seconds(), 1),
            }

            await websocket.send_json(payload)

        except Exception as e:
            logger.error(f"Failed to send response: {e}")


# Global singleton
ws_call_handler = WebSocketCallHandler()
