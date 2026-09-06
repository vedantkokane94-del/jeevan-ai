"""
JEEVAN AI — Pydantic Schemas for Emergency Tickets
"""

from datetime import datetime
from pydantic import BaseModel, Field


class VoiceTicketCreate(BaseModel):
    title: str
    description: str = ""
    severity: str = "HIGH"
    emergency_type: str = ""
    location: dict = Field(default_factory=lambda: {"latitude": 0.0, "longitude": 0.0})
    zone_id: str = ""
    landmark: str = ""
    language: str = "hi"
    caller_details: str = ""
    session_id: str = ""


class VoiceTicketRead(BaseModel):
    ticket_id: str
    incident_id: str | None = None
    session_id: str
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}
