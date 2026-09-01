"""
JEEVAN AI — SQLAlchemy Base

Declarative base for all ORM models. Import this Base into every model file.
"""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models."""

    pass
