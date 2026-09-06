"""
JEEVAN AI — Call Session Manager

Manages the lifecycle of voice call sessions including
creation, tracking, broadcasting status via Redis Pub/Sub,
and incident ticket creation via the main JEEVAN API.
"""

import json
import logging
import time
from typing import Any

import httpx

from app.core.config import settings
from app.core.security import encrypt_transcript, hash_phone_number, generate_session_id
from app.engine.conversation import conversation_engine, ConversationContext, ConversationResponse

logger = logging.getLogger(__name__)


class CallManager:
    """
    Manages active voice call sessions and coordinates between
    the conversation engine, Redis broadcasting, and incident API.
    """

    def __init__(self):
        self._redis = None
        self._http_client: httpx.AsyncClient | None = None

    async def initialize(self):
        """Initialize Redis and HTTP connections."""
        try:
            from redis.asyncio import from_url
            self._redis = from_url(settings.REDIS_URL, decode_responses=True)
            await self._redis.ping()
            logger.info("CallManager: Redis connected")
        except Exception as e:
            logger.warning(f"CallManager: Redis not available: {e}")
            self._redis = None

        self._http_client = httpx.AsyncClient(
            base_url=settings.JEEVAN_API_URL,
            timeout=10.0
        )

    async def shutdown(self):
        """Clean up connections."""
        if self._redis:
            await self._redis.aclose()
        if self._http_client:
            await self._http_client.aclose()

    async def start_call(self, caller_number: str | None = None) -> ConversationContext:
        """Start a new call session."""
        ctx = conversation_engine.create_session()
        logger.info(f"Call started: {ctx.session_id} | caller={caller_number or 'web'}")

        # Broadcast call started
        await self._broadcast({
            "event": "call_started",
            "session_id": ctx.session_id,
            "timestamp": time.time(),
        })

        return ctx

    async def end_call(self, session_id: str) -> dict:
        """End a call session and save logs."""
        ctx = conversation_engine.get_session(session_id)
        if not ctx:
            return {"status": "not_found"}

        duration = ctx.duration_seconds()

        # Encrypt and store transcript
        transcript_text = "\n".join(
            f"[{t['role'].upper()}] {t['content']}" for t in ctx.turns
        )
        encrypted = encrypt_transcript(transcript_text)

        result = {
            "session_id": session_id,
            "status": "COMPLETED",
            "duration_seconds": int(duration),
            "turn_count": len(ctx.turns),
            "emergency_type": ctx.emergency_type,
            "zone_id": ctx.zone_id,
            "landmark": ctx.landmark.landmark.name_en if ctx.landmark else None,
            "ticket_created": ctx.ticket_created,
            "incident_id": ctx.incident_id,
            "encrypted_transcript_length": len(encrypted),
        }

        # Broadcast call ended
        await self._broadcast({
            "event": "call_ended",
            "session_id": session_id,
            "duration_seconds": int(duration),
            "emergency_type": ctx.emergency_type,
            "timestamp": time.time(),
        })

        conversation_engine.end_session(session_id)
        logger.info(f"Call ended: {session_id} | duration={int(duration)}s")
        return result

    async def create_incident_ticket(
        self,
        ctx: ConversationContext,
        ticket_data: dict[str, Any]
    ) -> str | None:
        """Create an incident in the main JEEVAN API."""
        try:
            # Format for the incidents API
            payload = {
                "title": ticket_data.get("title", "[VOICE SOS] Emergency"),
                "description": (
                    f"{ticket_data.get('description', '')}\n\n"
                    f"--- Voice Call Details ---\n"
                    f"Session: {ctx.session_id}\n"
                    f"Language: {ctx.language}\n"
                    f"Zone: {ticket_data.get('zone_id', 'UNKNOWN')}\n"
                    f"Landmark: {ticket_data.get('landmark', 'Unknown')}\n"
                    f"Caller Info: {ticket_data.get('caller_details', '')}"
                ),
                "severity": ticket_data.get("severity", "HIGH"),
                "status": "NEW",
                "location": ticket_data.get("location", {"latitude": 19.9975, "longitude": 73.7898}),
            }

            logger.info(f"Creating incident ticket for session {ctx.session_id}")

            # In production, this would call the main API
            # For MVP, we generate a ticket ID and broadcast
            ticket_id = f"VT-{ctx.session_id[-8:]}"
            ctx.ticket_created = True
            ctx.incident_id = ticket_id

            # Broadcast ticket creation
            await self._broadcast({
                "event": "ticket_created",
                "session_id": ctx.session_id,
                "ticket_id": ticket_id,
                "emergency_type": ctx.emergency_type,
                "severity": ticket_data.get("severity"),
                "zone_id": ticket_data.get("zone_id"),
                "landmark": ticket_data.get("landmark"),
                "location": ticket_data.get("location"),
                "timestamp": time.time(),
            })

            return ticket_id

        except Exception as e:
            logger.error(f"Failed to create incident ticket: {e}")
            return None

    async def broadcast_call_update(self, ctx: ConversationContext):
        """Broadcast real-time call status to the Command Center."""
        await self._broadcast({
            "event": "call_update",
            "session_id": ctx.session_id,
            "state": ctx.state.value,
            "language": ctx.language,
            "emergency_type": ctx.emergency_type,
            "severity": ctx.emergency_severity,
            "zone_id": ctx.zone_id,
            "landmark": ctx.landmark.landmark.name_en if ctx.landmark else None,
            "duration_seconds": ctx.duration_seconds(),
            "turn_count": len(ctx.turns),
            "ticket_created": ctx.ticket_created,
            "timestamp": time.time(),
        })

    async def get_active_calls(self) -> list[dict]:
        """Get info about all active calls."""
        calls = []
        for sid, ctx in conversation_engine._active_sessions.items():
            calls.append({
                "session_id": ctx.session_id,
                "language": ctx.language,
                "state": ctx.state.value,
                "emergency_type": ctx.emergency_type,
                "severity": ctx.emergency_severity,
                "landmark": ctx.landmark.landmark.name_en if ctx.landmark else None,
                "zone": ctx.zone_id,
                "duration_seconds": round(ctx.duration_seconds(), 1),
                "turn_count": len(ctx.turns),
            })
        return calls

    async def _broadcast(self, message: dict):
        """Publish a message to the Redis voice calls channel."""
        if self._redis:
            try:
                await self._redis.publish(
                    settings.REDIS_VOICE_CHANNEL,
                    json.dumps(message, default=str)
                )
            except Exception as e:
                logger.warning(f"Redis broadcast failed: {e}")


# Global singleton
call_manager = CallManager()
