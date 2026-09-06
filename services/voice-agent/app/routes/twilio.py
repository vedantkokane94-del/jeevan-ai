"""
JEEVAN AI — Twilio Routes

Provides the HTTP Webhook endpoint for incoming calls
and the WebSocket endpoint for Media Streams.
"""

from fastapi import APIRouter, Request, WebSocket
from fastapi.responses import Response
from twilio.twiml.voice_response import VoiceResponse, Connect, Stream

from app.telephony.twilio_handler import TwilioStreamHandler
from app.core.config import settings

router = APIRouter(tags=["twilio"])


@router.post("/twilio/incoming")
async def twilio_incoming_call(request: Request):
    """
    Webhook called by Twilio when a user dials the phone number.
    Returns TwiML instructing Twilio to open a MediaStream to our WebSocket.
    """
    # Create TwiML response
    response = VoiceResponse()
    
    # We need to build the absolute WSS URL for the deployed service.
    # We can infer it from the request headers or use a configured host.
    host = request.headers.get("host", "localhost:8001")
    protocol = "wss" if "localhost" not in host else "ws"
    stream_url = f"{protocol}://{host}/api/v1/ws/twilio"
    
    # Connect the call to our WebSocket
    connect = Connect()
    connect.stream(url=stream_url)
    response.append(connect)
    
    return Response(
        content=str(response),
        media_type="application/xml"
    )


@router.websocket("/ws/twilio")
async def twilio_media_stream(websocket: WebSocket):
    """
    WebSocket endpoint that receives live audio from Twilio,
    processes it through the AI, and streams TTS back.
    """
    handler = TwilioStreamHandler(websocket)
    await handler.handle()
