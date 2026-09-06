"""
JEEVAN AI — Whisper Speech-to-Text Engine

Wraps OpenAI Whisper for real-time multilingual speech recognition
with focus on Hindi and Marathi.
"""

import io
import logging
import tempfile
import time
from dataclasses import dataclass, field

import numpy as np

from app.core.config import settings

logger = logging.getLogger(__name__)


@dataclass
class TranscriptionResult:
    """Result from a Whisper transcription."""
    text: str
    language: str  # Detected language code (hi, mr, en)
    confidence: float
    duration_seconds: float
    processing_time_ms: float


class WhisperSTTEngine:
    """
    Speech-to-Text engine using OpenAI Whisper.

    Supports Hindi (hi), Marathi (mr), and English (en) with
    automatic language detection.
    """

    def __init__(self):
        self._model = None
        self._model_name = settings.WHISPER_MODEL
        self._device = settings.WHISPER_DEVICE
        self._loaded = False

    async def load_model(self) -> None:
        """Load the Whisper model into memory. Call once at startup."""
        if self._loaded:
            return

        logger.info(
            f"Loading Whisper model '{self._model_name}' on {self._device}..."
        )
        try:
            import whisper
            self._model = whisper.load_model(
                self._model_name,
                device=self._device
            )
            self._loaded = True
            logger.info(
                f"Whisper model '{self._model_name}' loaded successfully."
            )
        except Exception as e:
            logger.error(f"Failed to load Whisper model: {e}")
            raise

    def is_loaded(self) -> bool:
        """Check if the model is loaded and ready."""
        return self._loaded

    async def transcribe_audio(
        self,
        audio_data: bytes,
        sample_rate: int = 16000,
        language_hint: str | None = None
    ) -> TranscriptionResult:
        """
        Transcribe raw PCM audio bytes to text.

        Args:
            audio_data: Raw PCM 16-bit audio bytes
            sample_rate: Audio sample rate (default 16000)
            language_hint: Optional language code ('hi', 'mr', 'en')

        Returns:
            TranscriptionResult with text, detected language, and confidence
        """
        if not self._loaded:
            raise RuntimeError("Whisper model not loaded. Call load_model() first.")

        start_time = time.perf_counter()

        # Convert bytes to numpy float32 array
        audio_np = np.frombuffer(audio_data, dtype=np.int16).astype(np.float32) / 32768.0
        duration_seconds = len(audio_np) / sample_rate

        # Skip very short audio (< 0.5 seconds)
        if duration_seconds < 0.5:
            return TranscriptionResult(
                text="",
                language="unknown",
                confidence=0.0,
                duration_seconds=duration_seconds,
                processing_time_ms=0.0
            )

        # Write to temp WAV for Whisper
        import soundfile as sf
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=True) as tmp:
            sf.write(tmp.name, audio_np, sample_rate)

            # Transcribe
            options = {
                "fp16": self._device == "cuda",
                "task": "transcribe",
            }

            if language_hint and language_hint in ("hi", "mr", "en"):
                options["language"] = language_hint

            result = self._model.transcribe(tmp.name, **options)

        processing_time = (time.perf_counter() - start_time) * 1000

        # Extract results
        text = result.get("text", "").strip()
        detected_lang = result.get("language", "unknown")

        # Calculate confidence from segment probabilities
        segments = result.get("segments", [])
        if segments:
            avg_logprob = sum(s.get("avg_logprob", -1.0) for s in segments) / len(segments)
            # Convert log probability to a 0-1 confidence score
            confidence = max(0.0, min(1.0, 1.0 + avg_logprob))
        else:
            confidence = 0.0

        logger.info(
            f"STT: '{text[:60]}...' | lang={detected_lang} | "
            f"conf={confidence:.2f} | time={processing_time:.0f}ms"
        )

        return TranscriptionResult(
            text=text,
            language=detected_lang,
            confidence=confidence,
            duration_seconds=duration_seconds,
            processing_time_ms=processing_time
        )

    async def transcribe_audio_stream(
        self,
        audio_chunks: list[bytes],
        sample_rate: int = 16000,
        language_hint: str | None = None
    ) -> TranscriptionResult:
        """
        Transcribe multiple audio chunks concatenated together.
        Used for accumulating audio over a conversation turn.
        """
        combined = b"".join(audio_chunks)
        return await self.transcribe_audio(combined, sample_rate, language_hint)


# Global singleton
stt_engine = WhisperSTTEngine()
