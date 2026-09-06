"""
JEEVAN AI — ElevenLabs Text-to-Speech Engine

Uses ElevenLabs for premium, human-like voice synthesis
in Marathi, Hindi, and English with a calm, reassuring tone.
"""

import logging
import time
from dataclasses import dataclass

from elevenlabs.client import ElevenLabs
from app.core.config import settings

logger = logging.getLogger(__name__)


@dataclass
class TTSResult:
    """Result from TTS synthesis."""
    audio_data: bytes  # MP3 audio bytes
    content_type: str  # MIME type
    text: str
    language: str
    voice: str
    duration_ms: float  # Approximate duration


# Language → Voice mapping
VOICE_MAP = {
    "mr": settings.TTS_VOICE_MARATHI,
    "hi": settings.TTS_VOICE_HINDI,
    "en": settings.TTS_VOICE_ENGLISH,
}


class ElevenLabsTTSEngine:
    """
    Premium Text-to-Speech engine using ElevenLabs.
    """

    def __init__(self):
        self._api_key = settings.ELEVENLABS_API_KEY
        self._client = ElevenLabs(api_key=self._api_key) if self._api_key else None
        
        if not self._client:
            logger.warning("ELEVENLABS_API_KEY not set! TTS will fail.")

    def _get_voice(self, language: str) -> str:
        """Resolve the voice name for a given language code."""
        return VOICE_MAP.get(language, settings.TTS_VOICE_HINDI)

    async def synthesize(
        self,
        text: str,
        language: str = "hi",
    ) -> TTSResult:
        """
        Synthesize speech from text.
        """
        voice_id = self._get_voice(language)
        start_time = time.perf_counter()

        logger.info(f"TTS: Synthesizing '{text[:50]}...' with voice={voice_id}")

        if not self._client:
            raise RuntimeError("ElevenLabs client not initialized (missing API key).")

        # Synchronous generator returned by generate()
        audio_generator = self._client.generate(
            text=text,
            voice=voice_id,
            model="eleven_multilingual_v2"
        )
        
        audio_data = b"".join(audio_generator)
        duration_ms = (time.perf_counter() - start_time) * 1000

        logger.info(
            f"TTS: Generated {len(audio_data)} bytes | "
            f"voice={voice_id} | time={duration_ms:.0f}ms"
        )

        return TTSResult(
            audio_data=audio_data,
            content_type="audio/mpeg",
            text=text,
            language=language,
            voice=voice_id,
            duration_ms=duration_ms
        )


# Global singleton
tts_engine = ElevenLabsTTSEngine()
