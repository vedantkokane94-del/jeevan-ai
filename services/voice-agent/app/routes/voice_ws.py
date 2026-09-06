"""
JEEVAN AI — WebSocket Voice Call Route
"""

from fastapi import APIRouter, WebSocket

from app.telephony.websocket_handler import ws_call_handler

router = APIRouter(tags=["voice-websocket"])


@router.websocket("/ws/voice-call")
async def voice_call_websocket(websocket: WebSocket):
    """
    WebSocket endpoint for voice emergency calls.

    Accepts audio/text from the caller, processes through
    the AI conversation engine, and returns TTS audio responses.
    """
    await ws_call_handler.handle_call(websocket)
