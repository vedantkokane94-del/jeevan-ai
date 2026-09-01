"""
JEEVAN AI — User Schemas
"""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    """Shared properties for all user schemas."""
    email: EmailStr
    full_name: str = Field(min_length=1, max_length=255)
    phone_number: str | None = Field(default=None, max_length=20)


class UserCreate(UserBase):
    """Properties required for user creation."""
    password: str = Field(min_length=8)
    role: str = Field(default="PUBLIC")


class UserRead(UserBase):
    """Properties returned when reading a user profile."""
    id: UUID
    role: str
    is_active: bool
    created_at: datetime

    model_config = {
        "from_attributes": True,
    }
