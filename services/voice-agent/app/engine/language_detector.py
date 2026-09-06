"""
JEEVAN AI — Language Detection Engine

Detects whether the caller is speaking Hindi, Marathi, or English
based on script-specific Unicode ranges and keyword analysis.
Also handles code-switching (mixing languages mid-sentence).
"""

import logging
import re
from dataclasses import dataclass

logger = logging.getLogger(__name__)

# Devanagari Unicode range (shared by Hindi and Marathi)
DEVANAGARI_RANGE = re.compile(r"[\u0900-\u097F]")

# Marathi-specific words and patterns (not commonly used in Hindi)
MARATHI_MARKERS = {
    "aahe", "ahe", "mala", "maza", "maze", "kasa", "kashi", "kay",
    "tyala", "tila", "amhi", "aamhi", "karun", "kela", "hota", "hoti",
    "padla", "padli", "jawal", "javal", "ithe", "tithe", "kuthey",
    "sangaa", "sanga", "bolaa", "bola", "ya", "yaa", "nahi", "nako",
    "deva", "bappa", "aarog", "shuddhivar", "bhetat", "ghya",
    "कृपया", "आहे", "माझा", "माझी", "माझे", "कसे", "काय",
    "त्याला", "तिला", "आम्ही", "करून", "केला", "पडला", "जवळ",
    "इथे", "तिथे", "कुठे", "सांगा", "बोला", "नाही", "नको",
    "शुद्धीवर", "मदत", "रुग्णवाहिका",
}

# Hindi-specific words and patterns (less common in Marathi)
HINDI_MARKERS = {
    "hai", "hain", "mera", "meri", "mere", "kaise", "kaisa", "kya",
    "usko", "uski", "hum", "humara", "kiya", "gaya", "gayi", "gaye",
    "gir", "girna", "yahan", "wahan", "kahan", "bolo", "batao",
    "bachao", "madad", "ambulance", "hosh",
    "है", "हैं", "मेरा", "मेरी", "मेरे", "कैसे", "क्या",
    "उसको", "उसकी", "हम", "हमारा", "गया", "गयी", "गये",
    "गिर", "यहाँ", "वहाँ", "कहाँ", "बोलो", "बताओ",
    "बचाओ", "मदद", "होश",
}


@dataclass
class LanguageDetectionResult:
    """Result of language detection."""
    primary_language: str  # 'hi', 'mr', or 'en'
    confidence: float  # 0.0 - 1.0
    is_mixed: bool  # True if code-switching detected
    secondary_language: str | None  # If mixed, the secondary language


def detect_language(text: str) -> LanguageDetectionResult:
    """
    Detect the primary language of a text input.

    Handles:
    - Pure Hindi / Marathi in Devanagari script
    - Romanized Hindi / Marathi (transliterated)
    - Mixed-language input (code-switching)
    - English

    Args:
        text: Input text from STT transcription

    Returns:
        LanguageDetectionResult with detected language and confidence
    """
    if not text or not text.strip():
        return LanguageDetectionResult(
            primary_language="hi",
            confidence=0.0,
            is_mixed=False,
            secondary_language=None
        )

    text_lower = text.lower().strip()
    words = set(re.split(r"\s+", text_lower))

    # Count Devanagari characters
    devanagari_count = len(DEVANAGARI_RANGE.findall(text))
    total_chars = len(re.sub(r"\s", "", text))
    devanagari_ratio = devanagari_count / max(total_chars, 1)

    # Count language-specific marker matches
    marathi_hits = len(words & MARATHI_MARKERS)
    hindi_hits = len(words & HINDI_MARKERS)

    # Also check for substrings (partial matches in romanized text)
    for marker in MARATHI_MARKERS:
        if marker in text_lower and marker not in words:
            marathi_hits += 0.5
    for marker in HINDI_MARKERS:
        if marker in text_lower and marker not in words:
            hindi_hits += 0.5

    total_hits = marathi_hits + hindi_hits

    # Decision logic
    if devanagari_ratio > 0.3 or total_hits > 0:
        # It's an Indic language
        if marathi_hits > hindi_hits:
            primary = "mr"
            secondary = "hi" if hindi_hits > 0 else None
            confidence = min(0.95, 0.5 + (marathi_hits / max(total_hits, 1)) * 0.5)
        elif hindi_hits > marathi_hits:
            primary = "hi"
            secondary = "mr" if marathi_hits > 0 else None
            confidence = min(0.95, 0.5 + (hindi_hits / max(total_hits, 1)) * 0.5)
        else:
            # Equal hits — default to Hindi (more widely spoken)
            primary = "hi"
            secondary = "mr" if marathi_hits > 0 else None
            confidence = 0.5
    else:
        # Likely English or unknown
        primary = "en"
        secondary = None
        confidence = 0.7

    is_mixed = marathi_hits > 0 and hindi_hits > 0

    logger.info(
        f"Language detection: '{text[:40]}...' → {primary} "
        f"(conf={confidence:.2f}, mixed={is_mixed})"
    )

    return LanguageDetectionResult(
        primary_language=primary,
        confidence=confidence,
        is_mixed=is_mixed,
        secondary_language=secondary
    )


def get_whisper_language_hint(detection: LanguageDetectionResult) -> str | None:
    """
    Convert detection result to Whisper language hint.
    Returns None for auto-detect if confidence is low.
    """
    if detection.confidence < 0.4:
        return None  # Let Whisper auto-detect
    return detection.primary_language
