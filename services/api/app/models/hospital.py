"""
JEEVAN AI — Hospital Database Model
"""
import uuid
from datetime import UTC, datetime

from geoalchemy2 import Geometry
from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class Hospital(Base):
    """Hospital facility record with capacity tracking."""
    __tablename__ = "hospitals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    address = Column(String(500), nullable=False)
    phone_number = Column(String(20), nullable=False)

    # Capabilities
    has_emergency = Column(Boolean, default=True, nullable=False)
    has_icu = Column(Boolean, default=False, nullable=False)
    has_blood_bank = Column(Boolean, default=False, nullable=False)
    specialties = Column(String(500), nullable=True)  # Comma-separated or JSON string

    # Live Capacity Status
    total_beds = Column(Integer, default=0, nullable=False)
    available_beds = Column(Integer, default=0, nullable=False)
    total_icu = Column(Integer, default=0, nullable=False)
    available_icu = Column(Integer, default=0, nullable=False)
    blood_stock_units = Column(Integer, default=0, nullable=False)

    # PostGIS Location
    location = Column(
        Geometry(geometry_type="POINT", srid=4326, spatial_index=True),
        nullable=False
    )

    last_updated = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
        nullable=False
    )
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)
