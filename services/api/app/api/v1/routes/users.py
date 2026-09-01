"""
JEEVAN AI — User Endpoints
"""

from fastapi import APIRouter

from app.api.dependencies import CurrentUser
from app.schemas.user import UserRead

router = APIRouter(tags=["users"])


@router.get("/users/me", response_model=UserRead)
async def read_user_me(current_user: CurrentUser) -> UserRead:
    """
    Get current user profile.
    Requires a valid JWT token.
    """
    return current_user  # type: ignore[return-value]
