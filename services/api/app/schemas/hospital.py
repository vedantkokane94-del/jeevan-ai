"""
JEEVAN AI — Hospital API Schemas
"""
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class HospitalBase(BaseModel):
    name: str = Field(..., max_length=255)
    address: str = Field(..., max_length=500)
    phone_number: str = Field(..., max_length=20)

    has_emergency: bool = True
    has_icu: bool = False
    has_blood_bank: bool = False
    specialties: str | None = None

    total_beds: int = 0
    available_beds: int = 0
    total_icu: int = 0
    available_icu: int = 0
    blood_stock_units: int = 0


class HospitalCreate(HospitalBase):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)


class HospitalResponse(HospitalBase):
    id: UUID
    latitude: float
    longitude: float
    distance_km: float | None = None  # Populated dynamically in nearby searches
    last_updated: datetime
    created_at: datetime

    class Config:
        from_attributes = True
