"""
JEEVAN AI — FastAPI Application Entry Point

Configures the FastAPI application with:
- CORS middleware (locked down, not wildcard — SRS §10.4)
- API v1 router
- Health check endpoint
"""

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.routes.ambulances import router as ambulances_router
from app.api.v1.routes.analytics import router as analytics_router
from app.api.v1.routes.auth import router as auth_router
from app.api.v1.routes.health import router as health_router
from app.api.v1.routes.hospitals import router as hospitals_router
from app.api.v1.routes.incidents import router as incidents_router
from app.api.v1.routes.sos import router as sos_router
from app.api.v1.routes.triage import router as triage_router
from app.api.v1.routes.users import router as users_router
from app.api.v1.routes.vision import router as vision_router
from app.api.v1.routes.ws import router as ws_router
from app.core.config import settings
from app.core.pubsub import pubsub_manager
from app.services.simulator import simulator


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None]:
    """Application lifespan handler for startup/shutdown events."""
    # Startup
    await pubsub_manager.connect()
    await simulator.start()
    yield
    # Shutdown
    await simulator.stop()
    await pubsub_manager.close()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Public Health Intelligence & Emergency Decision-Support Platform API",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

# CORS — locked down per SRS §10.4 (no wildcard origins in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Mount API v1 routes
app.include_router(health_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1")
app.include_router(users_router, prefix="/api/v1")
app.include_router(incidents_router, prefix="/api/v1")
app.include_router(ws_router, prefix="/api/v1")
app.include_router(analytics_router, prefix="/api/v1")
app.include_router(triage_router, prefix="/api/v1")
app.include_router(sos_router, prefix="/api/v1")
app.include_router(hospitals_router, prefix="/api/v1")
app.include_router(ambulances_router, prefix="/api/v1")
app.include_router(vision_router, prefix="/api/v1")
