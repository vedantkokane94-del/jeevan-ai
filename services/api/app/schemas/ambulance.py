"""
JEEVAN AI — Ambulance API Schemas
"""
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class AmbulanceBase(BaseModel):
    vehicle_number: str = Field(..., max_length=50)
    driver_id: UUID | None = None
    status: str = Field(default="AVAILABLE")
    current_speed_kmh: int = 0
    current_incident_id: UUID | None = None


class AmbulanceCreate(AmbulanceBase):
    pass


class AmbulanceUpdateLocation(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    speed_kmh: int | None = None


class AmbulanceResponse(AmbulanceBase):
    id: UUID
    latitude: float | None = None
    longitude: float | None = None
    last_ping: datetime

    class Config:
        from_attributes = True
