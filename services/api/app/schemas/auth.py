"""
JEEVAN AI — Authentication Schemas
"""

from pydantic import BaseModel


class Token(BaseModel):
    """OAuth2 standard token response."""
    access_token: str
    token_type: str


class TokenPayload(BaseModel):
    """Payload stored inside the JWT."""
    sub: str | None = None
    role: str | None = None
