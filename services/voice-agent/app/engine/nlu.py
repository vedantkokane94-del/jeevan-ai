"""
JEEVAN AI — Natural Language Understanding (NLU) Engine

Keyword-based intent classification and entity extraction
optimized for Kumbh Mela emergency scenarios in Hindi and Marathi.
"""

import logging
import re
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)


# ═══════════════════════════════════════════════
# INTENT DEFINITIONS
# ═══════════════════════════════════════════════

@dataclass
class Intent:
    """Detected user intent."""
    name: str
    confidence: float
    severity: str  # CRITICAL, HIGH, MEDIUM, LOW


@dataclass
class Entity:
    """Extracted entity from text."""
    type: str    # landmark, symptom, person_count, relation, etc.
    value: str
    original: str  # Original text that matched


@dataclass
class NLUResult:
    """Complete NLU analysis result."""
    intent: Intent
    entities: list[Entity] = field(default_factory=list)
    raw_text: str = ""
    emergency_summary: str = ""


# ═══════════════════════════════════════════════
# KEYWORD DATABASES (Hindi + Marathi + English)
# ═══════════════════════════════════════════════

INTENT_KEYWORDS = {
    "MEDICAL_EMERGENCY": {
        "severity": "CRITICAL",
        "keywords": [
            # Hindi
            "gir gaye", "gir gaya", "gir gayi", "behosh", "behos",
            "heart attack", "dil ka daura", "chest pain", "seene mein dard",
            "khoon", "blood", "bleeding", "fracture", "haddi tooti",
            "saans nahi", "breathing", "sans", "saas",
            "chakkar", "dizzy", "ulti", "vomit",
            "pain", "dard", "taklif", "takleef",
            # Marathi
            "padla", "padli", "padle", "behosh", "shuddhivar nahi",
            "hriday vik", "chhatit dukhat", "rakt", "hadad modli",
            "shvas", "gheri", "ulti",
            "dukhat", "dukhtay", "tras", "vikar",
            # English
            "unconscious", "not breathing", "hurt", "injured",
            "fell", "fallen", "collapsed", "seizure", "stroke",
            "accident", "emergency", "critical", "serious",
        ]
    },
    "HEATSTROKE": {
        "severity": "HIGH",
        "keywords": [
            "garmi", "dhoop", "sun", "sunstroke", "loo",
            "loo lagi", "garmi lagi", "pani", "dehydration",
            "ushna", "udhari", "tap", "gham", "unacha",
            "heatstroke", "heat stroke", "overheated", "fainting",
            "thirst", "pyaas", "pyaas lagi",
        ]
    },
    "DROWNING": {
        "severity": "CRITICAL",
        "keywords": [
            "doob", "doob raha", "doob gaya", "nadi", "river",
            "pani mein", "drowning", "water",
            "paanyat", "budit", "nadi madhe",
            "godavari", "kund", "ghat", "snan",
        ]
    },
    "CROWD_CRUSH": {
        "severity": "CRITICAL",
        "keywords": [
            "bheed", "bhid", "stampede", "crush",
            "dabav", "dabao", "log", "bahut log",
            "gardi", "chedchaad", "chenda", "tuda",
            "crowd", "pushing", "crushed", "trapped",
        ]
    },
    "FIRE": {
        "severity": "CRITICAL",
        "keywords": [
            "aag", "aag lagi", "fire", "jal raha",
            "dhuaan", "smoke", "blast",
            "aag lagali", "jaalit", "dhur",
            "burning", "flames", "explosion",
        ]
    },
    "MISSING_PERSON": {
        "severity": "HIGH",
        "keywords": [
            "kho gaya", "kho gayi", "missing", "lost",
            "nahi mil raha", "dhundh", "kayam",
            "haravla", "haravli", "sapadla nahi", "kuthey",
            "child lost", "baccha", "baalak", "mulga", "mulgi",
        ]
    },
    "GENERAL_HELP": {
        "severity": "MEDIUM",
        "keywords": [
            "madad", "help", "sahayata", "assistance",
            "information", "jaankari", "mahiti",
            "kaise", "kasa", "where", "kahan", "kuthe",
        ]
    }
}

# Relationship keywords for understanding who is affected
RELATION_KEYWORDS = {
    "papa": "father", "baba": "father", "pitaji": "father",
    "vadeelat": "father", "baba": "father",
    "maa": "mother", "amma": "mother", "aai": "mother",
    "bhai": "brother", "bhau": "brother", "dada": "elder_brother",
    "behen": "sister", "bahin": "sister", "tai": "elder_sister",
    "baccha": "child", "mulga": "boy", "mulgi": "girl",
    "dost": "friend", "mitra": "friend",
    "pati": "husband", "navra": "husband",
    "patni": "wife", "bayko": "wife",
    "dadi": "grandmother", "aaji": "grandmother",
    "dada": "grandfather", "ajoba": "grandfather",
}

# Count/quantity patterns
COUNT_PATTERN = re.compile(
    r"(\d+)\s*(log|logon|people|persons?|vyakti|jan|lok)",
    re.IGNORECASE
)


class NLUEngine:
    """
    Natural Language Understanding engine for emergency intent classification.

    Uses keyword-based matching optimized for Hindi, Marathi, and English
    emergency vocabulary used at Kumbh Mela.
    """

    def analyze(self, text: str) -> NLUResult:
        """
        Analyze text to extract intent and entities.

        Args:
            text: Transcribed text from caller

        Returns:
            NLUResult with classified intent and extracted entities
        """
        if not text or not text.strip():
            return NLUResult(
                intent=Intent(name="UNKNOWN", confidence=0.0, severity="LOW"),
                raw_text=text
            )

        lower = text.lower().strip()
        entities = []

        # --- Intent Classification ---
        best_intent = None
        best_score = 0

        for intent_name, intent_data in INTENT_KEYWORDS.items():
            score = 0
            for keyword in intent_data["keywords"]:
                if keyword in lower:
                    # Exact match gets higher score
                    score += len(keyword.split())  # Multi-word keywords score higher
            if score > best_score:
                best_score = score
                best_intent = Intent(
                    name=intent_name,
                    confidence=min(0.95, score * 0.15),
                    severity=intent_data["severity"]
                )

        if not best_intent:
            best_intent = Intent(name="UNKNOWN", confidence=0.1, severity="LOW")

        # --- Entity Extraction ---

        # 1. Relations (who is affected)
        for keyword, relation in RELATION_KEYWORDS.items():
            if keyword in lower:
                entities.append(Entity(
                    type="relation",
                    value=relation,
                    original=keyword
                ))

        # 2. People count
        count_match = COUNT_PATTERN.search(lower)
        if count_match:
            entities.append(Entity(
                type="person_count",
                value=count_match.group(1),
                original=count_match.group(0)
            ))

        # 3. Symptoms
        symptom_keywords = [
            "behosh", "unconscious", "shuddhivar nahi",
            "bleeding", "khoon", "rakt",
            "breathing", "saans", "shvas",
            "pain", "dard", "dukhat",
            "fever", "bukhar", "taap",
            "vomit", "ulti",
        ]
        for symptom in symptom_keywords:
            if symptom in lower:
                entities.append(Entity(
                    type="symptom",
                    value=symptom,
                    original=symptom
                ))

        # Generate emergency summary
        summary = self._generate_summary(best_intent, entities)

        result = NLUResult(
            intent=best_intent,
            entities=entities,
            raw_text=text,
            emergency_summary=summary
        )

        logger.info(
            f"NLU: intent={best_intent.name} ({best_intent.severity}) | "
            f"entities={len(entities)} | conf={best_intent.confidence:.2f}"
        )

        return result

    def _generate_summary(self, intent: Intent, entities: list[Entity]) -> str:
        """Generate a human-readable emergency summary."""
        parts = [f"Emergency Type: {intent.name.replace('_', ' ').title()}"]
        parts.append(f"Severity: {intent.severity}")

        relations = [e for e in entities if e.type == "relation"]
        if relations:
            parts.append(f"Affected: {', '.join(e.value for e in relations)}")

        symptoms = [e for e in entities if e.type == "symptom"]
        if symptoms:
            parts.append(f"Symptoms: {', '.join(e.value for e in symptoms)}")

        counts = [e for e in entities if e.type == "person_count"]
        if counts:
            parts.append(f"People affected: {counts[0].value}")

        return " | ".join(parts)


# Global singleton
nlu_engine = NLUEngine()
