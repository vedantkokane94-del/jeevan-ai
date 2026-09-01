"""
JEEVAN AI — Core API Configuration

Loads all settings from environment variables via Pydantic BaseSettings.
Secrets are never hardcoded (SRS §2.5, §10.4).
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # --- Application ---
    APP_NAME: str = "JEEVAN AI API"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False

    # --- Database (PostgreSQL + PostGIS) ---
    DATABASE_URL: str = "postgresql+asyncpg://jeevan:jeevan_dev@localhost:5432/jeevan_ai"
    DATABASE_URL_SYNC: str = "postgresql://jeevan:jeevan_dev@localhost:5432/jeevan_ai"

    # --- Redis ---
    REDIS_URL: str = "redis://localhost:6379/0"

    # --- Authentication ---
    JWT_SECRET: str = "CHANGE_ME_TO_A_RANDOM_SECRET_IN_PRODUCTION"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # --- CORS ---
    API_CORS_ORIGINS: str = "http://localhost:3000"

    # --- API ---
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000

    # --- AI Services ---
    AI_SERVICE_URL: str = "http://localhost:8001"

    # --- Map ---
    MAP_API_KEY: str = ""

    # --- Storage ---
    STORAGE_BUCKET: str = ""

    @property
    def cors_origins(self) -> list[str]:
        """Parse comma-separated CORS origins."""
        return [origin.strip() for origin in self.API_CORS_ORIGINS.split(",")]

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
    }


settings = Settings()
