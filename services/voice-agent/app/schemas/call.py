"""
JEEVAN AI — Pydantic Schemas for Voice Calls
"""

from datetime import datetime
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, Field


CallStatus = Literal["ACTIVE", "COMPLETED", "DROPPED", "TRANSFERRED"]


class CallSessionCreate(BaseModel):
    caller_number: str | None = None
    language: str = "hi"


class CallSessionRead(BaseModel):
    id: str
    session_id: str
    caller_number_hash: str | None = None
    language: str
    status: CallStatus
    started_at: datetime
    ended_at: datetime | None = None
    duration_seconds: int | None = None
    emergency_type: str | None = None
    landmark_detected: str | None = None
    zone_resolved: str | None = None
    incident_id: str | None = None
    turn_count: int = 0

    model_config = {"from_attributes": True}


class CallTurnRead(BaseModel):
    turn_number: int
    role: str
    content: str
    intent: str | None = None
    confidence: float | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class CallDetailRead(CallSessionRead):
    turns: list[CallTurnRead] = []


class ActiveCallInfo(BaseModel):
    session_id: str
    language: str
    state: str
    emergency_type: str
    severity: str
    landmark: str | None = None
    zone: str | None = None
    duration_seconds: float
    turn_count: int


class VoiceAnalytics(BaseModel):
    total_calls: int = 0
    active_calls: int = 0
    completed_calls: int = 0
    avg_duration_seconds: float = 0.0
    calls_by_language: dict[str, int] = {}
    calls_by_emergency_type: dict[str, int] = {}
    calls_by_zone: dict[str, int] = {}
    tickets_created: int = 0
