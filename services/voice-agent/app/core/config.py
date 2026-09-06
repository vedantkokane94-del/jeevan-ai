"""
JEEVAN AI — Voice Agent Configuration

All settings loaded from environment variables via Pydantic BaseSettings.
"""

from pydantic_settings import BaseSettings


class VoiceAgentSettings(BaseSettings):
    """Voice Agent microservice settings."""

    # --- Application ---
    APP_NAME: str = "JEEVAN AI Voice Agent"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False

    # --- Server ---
    HOST: str = "0.0.0.0"
    PORT: int = 8001

    # --- Whisper STT ---
    WHISPER_MODEL: str = "base"  # tiny, base, small, medium, large
    WHISPER_DEVICE: str = "cpu"  # cpu or cuda
    WHISPER_LANGUAGE: str | None = None  # None = auto-detect

    # --- ElevenLabs TTS ---
    ELEVENLABS_API_KEY: str = ""
    TTS_VOICE_MARATHI: str = "pNInz6obbfIdG2roUcmV"  # Example ElevenLabs Indian voice ID (Adam/Aarohi equivalent)
    TTS_VOICE_HINDI: str = "pNInz6obbfIdG2roUcmV" 
    TTS_VOICE_ENGLISH: str = "pNInz6obbfIdG2roUcmV"

    # --- Google Gemini AI ---
    GEMINI_API_KEY: str = ""
    TTS_RATE: str = "-10%"  # Slightly slower for clarity
    TTS_VOLUME: str = "+0%"

    # --- Database (shared with main API) ---
    DATABASE_URL: str = "postgresql+asyncpg://jeevan_admin:jeevan_secure_password@db:5432/jeevan_ai"

    # --- Redis ---
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_VOICE_CHANNEL: str = "jeevan-voice-calls"

    # --- Main API Integration ---
    JEEVAN_API_URL: str = "http://localhost:8000"
    JEEVAN_API_KEY: str = ""

    # --- Security ---
    VOICE_ENCRYPTION_KEY: str = "CHANGE_ME_TO_A_32_BYTE_KEY_IN_PRODUCTION_1234"
    JWT_SECRET: str = "CHANGE_ME_TO_A_RANDOM_SECRET_IN_PRODUCTION"
    JWT_ALGORITHM: str = "HS256"

    # --- Call Settings ---
    MAX_CALL_DURATION_SECONDS: int = 600  # 10 minutes max
    SILENCE_TIMEOUT_SECONDS: int = 15  # Re-prompt after 15s silence
    MAX_CONCURRENT_CALLS: int = 50

    # --- Audio ---
    AUDIO_SAMPLE_RATE: int = 16000
    AUDIO_CHANNELS: int = 1
    AUDIO_CHUNK_DURATION_MS: int = 500  # Process audio in 500ms chunks

    # --- CORS ---
    CORS_ORIGINS: str = "http://localhost:3000"

    @property
    def cors_origins(self) -> list[str]:
        """Parse comma-separated CORS origins."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
        "env_prefix": "VOICE_",
    }


settings = VoiceAgentSettings()
