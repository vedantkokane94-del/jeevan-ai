"""
JEEVAN AI — Incident Schemas
"""

from datetime import datetime

# Matches the ENUM in the database
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field

IncidentSeverity = Literal["CRITICAL", "HIGH", "MEDIUM", "LOW"]
IncidentStatus = Literal["NEW", "DISPATCHED", "RESPONDING", "RESOLVED"]


class Location(BaseModel):
    """GeoJSON style location representing a PostGIS Point."""
    longitude: float = Field(..., ge=-180, le=180)
    latitude: float = Field(..., ge=-90, le=90)


class IncidentBase(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    severity: IncidentSeverity = "LOW"
    status: IncidentStatus = "NEW"


class IncidentCreate(IncidentBase):
    """Properties required to report an incident."""
    location: Location


class IncidentUpdate(BaseModel):
    """Properties to update an incident (e.g. status changes)."""
    status: IncidentStatus | None = None
    assigned_to_id: UUID | None = None


class IncidentRead(IncidentBase):
    """Properties returned when reading an incident."""
    id: UUID
    location: Location
    reported_by_id: UUID | None
    assigned_to_id: UUID | None
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }
