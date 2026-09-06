"""
JEEVAN AI — Voice Agent Health Check Route
"""

from fastapi import APIRouter

from app.core.config import settings
from app.engine.stt import stt_engine

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check():
    """Health check endpoint for the voice agent service."""
    return {
        "status": "ok",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "whisper_model": settings.WHISPER_MODEL,
        "whisper_loaded": stt_engine.is_loaded(),
        "max_concurrent_calls": settings.MAX_CONCURRENT_CALLS,
    }
