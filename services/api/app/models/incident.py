"""
JEEVAN AI — Incident Database Model
"""
import uuid
from datetime import UTC, datetime

from geoalchemy2 import Geometry
from sqlalchemy import Column, DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class Incident(Base):
    """Core emergency incident record with geospatial awareness."""
    __tablename__ = "incidents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Core Data
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)

    # Enumerations matching SRS §2.5 Types
    severity = Column(
        Enum("CRITICAL", "HIGH", "MEDIUM", "LOW", name="incident_severity"),
        nullable=False,
        default="LOW"
    )
    status = Column(
        Enum("NEW", "DISPATCHED", "RESPONDING", "RESOLVED", name="incident_status"),
        nullable=False,
        default="NEW"
    )

    # Geospatial Data (PostGIS Point: Longitude, Latitude)
    # SRID 4326 is standard GPS coordinates (WGS 84)
    location = Column(
        Geometry(geometry_type="POINT", srid=4326, spatial_index=True),
        nullable=False
    )

    # Tracking
    reported_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    assigned_to_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
        nullable=False
    )

    # Relationships
    reporter = relationship("User", foreign_keys=[reported_by_id])
    assignee = relationship("User", foreign_keys=[assigned_to_id])
