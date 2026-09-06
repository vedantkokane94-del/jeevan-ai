"""
JEEVAN AI — Kumbh Mela Landmark Intelligence

Maps spoken landmark names (in Hindi, Marathi, English, and romanized variants)
to GPS coordinates and operational zones for the Nashik Simhastha Kumbh Mela 2027.

Uses fuzzy matching to handle accents, mispronunciations, and speech-to-text errors.
"""

import logging
from dataclasses import dataclass

from rapidfuzz import fuzz, process

logger = logging.getLogger(__name__)


@dataclass
class LandmarkInfo:
    """Information about a Kumbh Mela landmark."""
    id: str
    name_en: str
    name_hi: str
    name_mr: str
    latitude: float
    longitude: float
    zone_id: str
    zone_name: str
    description: str


@dataclass
class LandmarkMatch:
    """Result of a landmark search."""
    landmark: LandmarkInfo
    match_score: float  # 0-100
    matched_alias: str  # Which alias triggered the match


# ═══════════════════════════════════════════════
# NASHIK KUMBH MELA LANDMARK DATABASE
# ═══════════════════════════════════════════════

KUMBH_LANDMARKS: list[LandmarkInfo] = [
    LandmarkInfo(
        id="ramkund",
        name_en="Ramkund",
        name_hi="रामकुंड",
        name_mr="रामकुंड",
        latitude=19.9975,
        longitude=73.7898,
        zone_id="ZONE_A_CENTRAL",
        zone_name="Central Godavari Zone",
        description="Sacred bathing ghat on Godavari river — highest pilgrim density zone"
    ),
    LandmarkInfo(
        id="godavari_ghats",
        name_en="Godavari Ghats",
        name_hi="गोदावरी घाट",
        name_mr="गोदावरी घाट",
        latitude=19.9960,
        longitude=73.7885,
        zone_id="ZONE_A_CENTRAL",
        zone_name="Central Godavari Zone",
        description="Main bathing ghats along the Godavari river"
    ),
    LandmarkInfo(
        id="panchavati",
        name_en="Panchavati",
        name_hi="पंचवटी",
        name_mr="पंचवटी",
        latitude=20.0086,
        longitude=73.7914,
        zone_id="ZONE_B_NORTH",
        zone_name="Panchavati North Zone",
        description="Sacred area associated with Lord Rama's exile"
    ),
    LandmarkInfo(
        id="kalaram_temple",
        name_en="Kalaram Temple",
        name_hi="कालाराम मंदिर",
        name_mr="काळाराम मंदिर",
        latitude=20.0070,
        longitude=73.7890,
        zone_id="ZONE_B_NORTH",
        zone_name="Panchavati North Zone",
        description="Historic black stone Rama temple in Panchavati"
    ),
    LandmarkInfo(
        id="tapovan",
        name_en="Tapovan",
        name_hi="तपोवन",
        name_mr="तपोवन",
        latitude=20.0200,
        longitude=73.7800,
        zone_id="ZONE_C_OUTER",
        zone_name="Tapovan Outer Zone",
        description="Sacred forest area at the northern edge of Nashik"
    ),
    LandmarkInfo(
        id="trimbakeshwar",
        name_en="Trimbakeshwar Temple",
        name_hi="त्र्यंबकेश्वर मंदिर",
        name_mr="त्र्यंबकेश्वर मंदिर",
        latitude=19.9323,
        longitude=73.5311,
        zone_id="ZONE_D_TRIMBAK",
        zone_name="Trimbakeshwar Zone",
        description="Jyotirlinga temple — major Kumbh event site"
    ),
    LandmarkInfo(
        id="kushavarta_kund",
        name_en="Kushavarta Kund",
        name_hi="कुशावर्त कुंड",
        name_mr="कुशावर्त कुंड",
        latitude=19.9330,
        longitude=73.5290,
        zone_id="ZONE_D_TRIMBAK",
        zone_name="Trimbakeshwar Zone",
        description="Sacred water tank near Trimbakeshwar — Shahi Snan site"
    ),
    LandmarkInfo(
        id="sita_gufa",
        name_en="Sita Gufa",
        name_hi="सीता गुफा",
        name_mr="सीता गुहा",
        latitude=20.0090,
        longitude=73.7920,
        zone_id="ZONE_B_NORTH",
        zone_name="Panchavati North Zone",
        description="Cave where Sita is said to have hidden during exile"
    ),
    LandmarkInfo(
        id="muktidham",
        name_en="Muktidham Temple",
        name_hi="मुक्तिधाम मंदिर",
        name_mr="मुक्तिधाम मंदिर",
        latitude=20.0050,
        longitude=73.7750,
        zone_id="ZONE_C_OUTER",
        zone_name="Tapovan Outer Zone",
        description="White marble temple complex on the outskirts"
    ),
    LandmarkInfo(
        id="someshwar",
        name_en="Someshwar Temple",
        name_hi="सोमेश्वर मंदिर",
        name_mr="सोमेश्वर मंदिर",
        latitude=19.9850,
        longitude=73.8000,
        zone_id="ZONE_E_SOUTH",
        zone_name="South Nashik Zone",
        description="Ancient Shiva temple south of the main event zone"
    ),
    LandmarkInfo(
        id="nashik_road_station",
        name_en="Nashik Road Railway Station",
        name_hi="नासिक रोड रेलवे स्टेशन",
        name_mr="नाशिक रोड रेल्वे स्थानक",
        latitude=19.9690,
        longitude=73.7990,
        zone_id="ZONE_F_TRANSIT",
        zone_name="Transit & Transport Zone",
        description="Main railway station — pilgrim arrival/departure hub"
    ),
    LandmarkInfo(
        id="cbs_nashik",
        name_en="CBS Nashik Bus Stand",
        name_hi="सीबीएस नासिक बस स्टैंड",
        name_mr="सीबीएस नाशिक बसस्थानक",
        latitude=19.9950,
        longitude=73.7850,
        zone_id="ZONE_F_TRANSIT",
        zone_name="Transit & Transport Zone",
        description="Central bus station — major transit hub"
    ),
]

# Build alias database for fuzzy matching
# Maps every possible way someone might say a landmark name → landmark ID
LANDMARK_ALIASES: dict[str, str] = {}

_ALIAS_MAP = {
    "ramkund": [
        "ramkund", "ram kund", "raamkund", "raam kund",
        "ramkunda", "ram ghat", "रामकुंड", "राम कुंड",
    ],
    "godavari_ghats": [
        "godavari ghat", "godavari ghats", "godavri ghat",
        "nadi ghat", "river ghat", "main ghat",
        "गोदावरी घाट", "गोदावरी", "नदी किनारा",
    ],
    "panchavati": [
        "panchavati", "panchwati", "panchvati", "punch wati",
        "पंचवटी",
    ],
    "kalaram_temple": [
        "kalaram", "kala ram", "kalaram mandir", "kala ram temple",
        "black ram temple", "काळाराम", "कालाराम", "काळाराम मंदिर",
    ],
    "tapovan": [
        "tapovan", "tapo van", "tap van", "तपोवन",
    ],
    "trimbakeshwar": [
        "trimbakeshwar", "trimbak", "trimbakeswar", "tryambak",
        "tryambakeshwar", "trimbak mandir", "jyotirlinga",
        "त्र्यंबकेश्वर", "त्रिंबक", "त्रिंबकेश्वर",
    ],
    "kushavarta_kund": [
        "kushavarta", "kushavart", "kushavarta kund", "kushawart",
        "kushavrut", "कुशावर्त", "कुशावर्त कुंड",
    ],
    "sita_gufa": [
        "sita gufa", "sita guha", "sita cave", "seeta gufa",
        "सीता गुफा", "सीता गुहा",
    ],
    "muktidham": [
        "muktidham", "mukti dham", "muktidham mandir",
        "white temple", "marble temple",
        "मुक्तिधाम",
    ],
    "someshwar": [
        "someshwar", "someshwar mandir", "someshwar temple",
        "सोमेश्वर",
    ],
    "nashik_road_station": [
        "nashik road", "nashik station", "railway station",
        "station", "rail", "train", "नासिक रोड", "नाशिक रोड",
        "स्टेशन", "रेल्वे",
    ],
    "cbs_nashik": [
        "cbs", "bus stand", "bus station", "central bus",
        "सीबीएस", "बसस्थानक", "बस स्टैंड",
    ],
}

for landmark_id, aliases in _ALIAS_MAP.items():
    for alias in aliases:
        LANDMARK_ALIASES[alias.lower()] = landmark_id

# Build lookup by ID
LANDMARK_BY_ID = {lm.id: lm for lm in KUMBH_LANDMARKS}


class LandmarkResolver:
    """
    Resolves spoken landmark references to structured location data
    using fuzzy string matching.
    """

    def __init__(self, min_score: float = 60.0):
        self._min_score = min_score
        self._alias_list = list(LANDMARK_ALIASES.keys())

    def resolve(self, text: str) -> LandmarkMatch | None:
        """
        Find the best matching landmark from free-form text.

        Args:
            text: Text to search for landmark references

        Returns:
            LandmarkMatch if found above threshold, else None
        """
        if not text or not text.strip():
            return None

        text_lower = text.lower().strip()

        # 1. Try exact substring match first
        for alias, landmark_id in LANDMARK_ALIASES.items():
            if alias in text_lower:
                landmark = LANDMARK_BY_ID.get(landmark_id)
                if landmark:
                    logger.info(
                        f"Landmark: Exact match '{alias}' → {landmark.name_en}"
                    )
                    return LandmarkMatch(
                        landmark=landmark,
                        match_score=100.0,
                        matched_alias=alias
                    )

        # 2. Fuzzy match against all aliases
        # Split text into words and try matching word groups
        words = text_lower.split()
        candidates = []

        # Try 1-word, 2-word, and 3-word combinations
        for n in range(1, min(4, len(words) + 1)):
            for i in range(len(words) - n + 1):
                phrase = " ".join(words[i:i + n])
                match = process.extractOne(
                    phrase,
                    self._alias_list,
                    scorer=fuzz.ratio,
                    score_cutoff=self._min_score
                )
                if match:
                    alias_text, score, _ = match
                    landmark_id = LANDMARK_ALIASES[alias_text]
                    landmark = LANDMARK_BY_ID.get(landmark_id)
                    if landmark:
                        candidates.append(LandmarkMatch(
                            landmark=landmark,
                            match_score=score,
                            matched_alias=alias_text
                        ))

        if candidates:
            best = max(candidates, key=lambda m: m.match_score)
            logger.info(
                f"Landmark: Fuzzy match '{best.matched_alias}' → "
                f"{best.landmark.name_en} (score={best.match_score:.0f})"
            )
            return best

        return None

    def get_zone_info(self, zone_id: str) -> dict:
        """Get information about a Kumbh operational zone."""
        zone_data = {
            "ZONE_A_CENTRAL": {
                "name": "Central Godavari Zone",
                "risk_level": "VERY_HIGH",
                "description": "Highest density zone — Ramkund and main ghats",
                "nearest_hospital": "Nashik Civil Hospital",
                "nearest_hospital_distance_km": 2.5,
            },
            "ZONE_B_NORTH": {
                "name": "Panchavati North Zone",
                "risk_level": "HIGH",
                "description": "Temple complex zone — Kalaram, Sita Gufa",
                "nearest_hospital": "Bytco Hospital",
                "nearest_hospital_distance_km": 1.8,
            },
            "ZONE_C_OUTER": {
                "name": "Tapovan Outer Zone",
                "risk_level": "MEDIUM",
                "description": "Outer perimeter — lower density",
                "nearest_hospital": "Wockhardt Hospital",
                "nearest_hospital_distance_km": 3.0,
            },
            "ZONE_D_TRIMBAK": {
                "name": "Trimbakeshwar Zone",
                "risk_level": "HIGH",
                "description": "Trimbakeshwar temple complex — 30km from Nashik",
                "nearest_hospital": "Trimbak Rural Hospital",
                "nearest_hospital_distance_km": 1.0,
            },
            "ZONE_E_SOUTH": {
                "name": "South Nashik Zone",
                "risk_level": "LOW",
                "description": "Residential areas south of the event zone",
                "nearest_hospital": "Nashik Civil Hospital",
                "nearest_hospital_distance_km": 4.0,
            },
            "ZONE_F_TRANSIT": {
                "name": "Transit & Transport Zone",
                "risk_level": "MEDIUM",
                "description": "Railway station and bus stands — arrival/departure hubs",
                "nearest_hospital": "Nashik District Hospital",
                "nearest_hospital_distance_km": 2.0,
            },
        }
        return zone_data.get(zone_id, {
            "name": "Unknown Zone",
            "risk_level": "UNKNOWN",
        })


# Global singleton
landmark_resolver = LandmarkResolver()
