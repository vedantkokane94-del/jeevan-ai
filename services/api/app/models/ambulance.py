"""
JEEVAN AI — Ambulance Database Model
"""
import uuid
from datetime import UTC, datetime

from geoalchemy2 import Geometry
from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class Ambulance(Base):
    """Ambulance fleet tracking and dispatch status."""
    __tablename__ = "ambulances"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vehicle_number = Column(String(50), unique=True, nullable=False)
    driver_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    status = Column(
        Enum(
            "AVAILABLE", "DISPATCHED", "EN_ROUTE",
            "AT_SCENE", "RETURNING", "OFFLINE",
            name="ambulance_status"
        ),
        nullable=False,
        default="AVAILABLE"
    )

    # PostGIS Location for real-time fleet map
    current_location = Column(
        Geometry(geometry_type="POINT", srid=4326, spatial_index=True),
        nullable=True
    )

    current_speed_kmh = Column(Integer, default=0)
    current_incident_id = Column(UUID(as_uuid=True), ForeignKey("incidents.id"), nullable=True)

    last_ping = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
        nullable=False
    )

    # Relationships
    driver = relationship("User", foreign_keys=[driver_id])
    incident = relationship("Incident", foreign_keys=[current_incident_id])
