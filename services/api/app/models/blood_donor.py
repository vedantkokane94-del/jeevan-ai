"""
JEEVAN AI — Blood Donor Database Model
"""
import uuid
from datetime import UTC, datetime

from geoalchemy2 import Geometry
from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class BloodDonor(Base):
    """Verified blood donors available for emergency requests."""
    __tablename__ = "blood_donors"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)

    blood_group = Column(
        Enum("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", name="blood_group"),
        nullable=False
    )

    is_available = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)

    # PostGIS Location for nearest donor matching
    location = Column(
        Geometry(geometry_type="POINT", srid=4326, spatial_index=True),
        nullable=True
    )

    last_donated = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
