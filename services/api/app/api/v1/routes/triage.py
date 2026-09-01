"""
JEEVAN AI — AI Triage API

Endpoints for the public-facing AI symptom evaluation chatbot.
"""

from typing import Literal

from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter(tags=["triage"])

class TriageRequest(BaseModel):
    message: str = Field(..., max_length=1000)

class TriageResponse(BaseModel):
    response: str
    action: Literal["ADVISE_REST", "TRIGGER_SOS", "SEEK_MEDICAL_TENT", "GENERAL_INFO"]
    confidence: float


@router.post("/chat", response_model=TriageResponse)
async def triage_chat(request: TriageRequest) -> TriageResponse:
    """
    Public unauthenticated endpoint for symptom triage.
    In Phase 4, this returns mocked AI logic based on keywords.
    """
    msg = request.message.lower()

    if "stampede" in msg or "crush" in msg or "fire" in msg or "heart" in msg:
        return TriageResponse(
            response=(
                "This sounds like a critical emergency. Please press the SOS button "
                "immediately so we can dispatch a responder to your location."
            ),
            action="TRIGGER_SOS",
            confidence=0.95
        )
    elif "dizzy" in msg or "faint" in msg or "water" in msg or "heat" in msg:
        return TriageResponse(
            response=(
                "You may be experiencing heat exhaustion. Please find shade immediately, "
                "drink water, and rest. If symptoms worsen, locate the nearest medical tent."
            ),
            action="ADVISE_REST",
            confidence=0.88
        )
    elif "where is" in msg or "tent" in msg or "hospital" in msg:
        return TriageResponse(
            response=(
                "Please check the map for the nearest medical tent or follow the green "
                "emergency exit signs."
            ),
            action="SEEK_MEDICAL_TENT",
            confidence=0.90
        )
    else:
        return TriageResponse(
            response=(
                "I am the JEEVAN AI assistant. I can help evaluate symptoms or direct you "
                "to emergency services. How can I help you?"
            ),
            action="GENERAL_INFO",
            confidence=0.99
        )
