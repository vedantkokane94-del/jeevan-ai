"""
JEEVAN AI — Health Check Endpoint

GET /api/v1/health — returns service status, version, and timestamp.
"""

from datetime import UTC, datetime

from fastapi import APIRouter

from app.core.config import settings

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check() -> dict:
    """
    Health check endpoint.

    Returns the service status, version, and current UTC timestamp.
    """
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "timestamp": datetime.now(UTC).isoformat(),
    }
