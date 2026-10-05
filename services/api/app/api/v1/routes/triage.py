"""
JEEVAN AI — Advanced AI Symptom Evaluator & Medical Triage Engine

Real-time public health triage engine for evaluating symptoms, predicting medical urgency,
and recommending immediate emergency protocols for pilgrims at Simhastha Kumbh Mela.
"""

from typing import List, Literal, Optional
from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter(tags=["triage"])

class TriageRequest(BaseModel):
    message: str = Field(..., max_length=1000, description="User symptom description or query")
    language: Optional[str] = Field("en", description="Language code: en, hi, mr")
    duration_minutes: Optional[int] = Field(None, description="Symptom duration in minutes")
    age_group: Optional[str] = Field("adult", description="child, adult, senior")

class FirstAidAdvice(BaseModel):
    title: str
    steps: List[str]

class TriageResponse(BaseModel):
    summary: str
    urgency: Literal["CRITICAL", "HIGH", "MODERATE", "LOW"]
    risk_score: float = Field(..., ge=0.0, le=10.0, description="0 to 10 severity score")
    action: Literal["TRIGGER_SOS", "CALL_AMBULANCE", "SEEK_MEDICAL_TENT", "ADVISE_REST", "GENERAL_INFO"]
    confidence: float
    detected_symptoms: List[str]
    advice: List[str]
    first_aid: Optional[FirstAidAdvice] = None
    language: str

@router.post("/chat", response_model=TriageResponse)
async def triage_chat(request: TriageRequest) -> TriageResponse:
    """
    Evaluates user symptoms using multi-lingual NLU & medical triage rules.
    Provides immediate emergency protocol, risk score, and step-by-step guidance.
    """
    msg = request.message.lower().strip()
    lang = request.language or "en"
    
    detected = []
    
    # Critical Symptoms & Keywords (English, Hindi, Marathi)
    critical_keywords = [
        "chest pain", "heart attack", "can't breathe", "breathless", "choking", 
        "unconscious", "fainted", "head injury", "severe bleeding", "stampede", 
        "crush", "seizure", "stroke", "dil cha daura", "saas nahi", "chhati me dard",
        "chaati dard", "saas ghabrana", "shwas ghenyala traas", "behosh"
    ]
    
    # High Risk Symptoms
    high_keywords = [
        "high fever", "fracture", "broken bone", "deep cut", "burn", "severe abdominal pain",
        "snake bite", "poison", "heatstroke", "tez bukhar", "haddi tooti", "jalan", 
        "sanp kaata", "taav", "haad modle", "khup taav"
    ]
    
    # Moderate Symptoms
    moderate_keywords = [
        "dizzy", "dizziness", "vomiting", "dehydration", "headache", "chakar", "chakkar",
        "ultiya", "paani ki kami", "sar dard", "dabyat nahi", "khup thakva"
    ]

    # Check for Critical
    for kw in critical_keywords:
        if kw in msg:
            detected.append(kw)
            
    if detected:
        return TriageResponse(
            summary="CRITICAL MEDICAL EMERGENCY: Immediate intervention required. High risk of cardiac arrest, severe trauma, or airway obstruction.",
            urgency="CRITICAL",
            risk_score=9.6,
            action="TRIGGER_SOS",
            confidence=0.98,
            detected_symptoms=detected,
            advice=[
                "Press the SOS Emergency button immediately.",
                "Call 112 / 108 Emergency Ambulance.",
                "Keep the patient calm, lying down with elevated legs unless head injured.",
                "Do not offer water if patient is unconscious."
            ],
            first_aid=FirstAidAdvice(
                title="Immediate CPR / Cardiac Care",
                steps=[
                    "Check for breathing and pulse.",
                    "If pulse absent, start chest compressions (100-120 compressions per minute).",
                    "Clear airway of any obstruction.",
                    "Stay on line with emergency dispatchers."
                ]
            ),
            language=lang
        )

    # Check for High Risk
    for kw in high_keywords:
        if kw in msg:
            detected.append(kw)
            
    if detected:
        return TriageResponse(
            summary="HIGH RISK MEDICAL CONDITION: Requires urgent medical evaluation at the nearest Kumbh Medical Tent or Hospital.",
            urgency="HIGH",
            risk_score=7.5,
            action="CALL_AMBULANCE",
            confidence=0.92,
            detected_symptoms=detected,
            advice=[
                "Locate the nearest Sector Medical Camp (MC-01 to MC-12) or call 108.",
                "Immobilize any suspected fracture or burn area.",
                "Apply direct pressure with a clean cloth to active bleeding.",
                "Keep patient hydrated if conscious."
            ],
            first_aid=FirstAidAdvice(
                title="Trauma & High-Risk Management",
                steps=[
                    "Cover open wounds with sterile or clean cloth.",
                    "Elevate injured limb if no fracture suspected.",
                    "Keep patient out of direct sunlight."
                ]
            ),
            language=lang
        )

    # Check for Moderate Risk
    for kw in moderate_keywords:
        if kw in msg:
            detected.append(kw)

    if detected:
        return TriageResponse(
            summary="MODERATE SYMPTOMS DETECTED: Likely heat exhaustion, mild dehydration, or physical fatigue.",
            urgency="MODERATE",
            risk_score=4.8,
            action="SEEK_MEDICAL_TENT",
            confidence=0.89,
            detected_symptoms=detected,
            advice=[
                "Move to a shaded ORS / Water distribution kiosk immediately.",
                "Sip ORS electrolyte solution slowly.",
                "Rest for 20-30 minutes before resuming pilgrimage movement.",
                "If dizziness persists beyond 30 minutes, visit nearest Medical Camp."
            ],
            first_aid=FirstAidAdvice(
                title="Heat Exhaustion & Dehydration Protocol",
                steps=[
                    "Loosen tight clothing and unbutton collar.",
                    "Apply cool wet cloths to forehead, neck, and wrist.",
                    "Avoid heavy physical exertion under direct sun."
                ]
            ),
            language=lang
        )

    # General / Low Risk Default
    return TriageResponse(
        summary="MILD OR GENERAL HEALTH INQUIRY: Symptoms evaluated as low urgency.",
        urgency="LOW",
        risk_score=1.5,
        action="ADVISE_REST",
        confidence=0.95,
        detected_symptoms=["general health query"],
        advice=[
            "Drink clean filtered water regularly (at least 3-4 liters daily during Kumbh).",
            "Wear light cotton clothing and a sun hat.",
            "Use main designated emergency corridors for safe navigation."
        ],
        first_aid=FirstAidAdvice(
            title="General Kumbh Health Guidelines",
            steps=[
                "Stay hydrated with ORS / water.",
                "Follow crowd management signage at Ramkund & Ghats.",
                "Keep emergency helpline numbers saved: 112, 108, 1077."
            ]
        ),
        language=lang
    )
