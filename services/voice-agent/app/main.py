"""
JEEVAN AI — Voice Agent Microservice Entry Point

Configures the FastAPI application for the AI Emergency Calling Agent
with WebSocket voice call handling, REST APIs, and CORS middleware.
"""

import logging
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.engine.stt import stt_engine
from app.routes.calls import router as calls_router
from app.routes.health import router as health_router
from app.routes.twilio import router as twilio_router
from app.routes.voice_ws import router as voice_ws_router
from app.telephony.call_manager import call_manager

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(name)-30s | %(levelname)-7s | %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None]:
    """Application lifespan handler for startup/shutdown."""
    # Startup
    logger.info("=" * 60)
    logger.info(f"  {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"  Whisper Model: {settings.WHISPER_MODEL}")
    logger.info(f"  Device: {settings.WHISPER_DEVICE}")
    logger.info("=" * 60)

    # Load Whisper model
    await stt_engine.load_model()

    # Initialize call manager (Redis + HTTP)
    await call_manager.initialize()

    logger.info("Voice Agent ready to accept calls.")
    yield

    # Shutdown
    await call_manager.shutdown()
    logger.info("Voice Agent shut down.")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "AI Emergency Calling Agent for JEEVAN AI — "
        "Nashik Simhastha Kumbh Mela 2027. "
        "Provides voice-based emergency assistance in Marathi and Hindi."
    ),
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Mount routes
app.include_router(health_router, prefix="/api/v1")
app.include_router(calls_router, prefix="/api/v1")
app.include_router(twilio_router, prefix="/api/v1")
app.include_router(voice_ws_router, prefix="/api/v1")
