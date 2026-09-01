"""
JEEVAN AI — WebSocket Endpoints

Handles real-time streaming of incidents to connected clients via Redis Pub/Sub.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect, status
from jose import JWTError, jwt

from app.core.config import settings
from app.core.pubsub import pubsub_manager
from app.schemas.auth import TokenPayload

router = APIRouter(tags=["websockets"])


async def get_ws_current_user(token: Annotated[str, Query()]) -> str:
    """Validate JWT token passed as a query parameter for WebSockets."""
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM]
        )
        token_data = TokenPayload(**payload)
        if not token_data.sub:
            raise ValueError("No subject in token")
        return token_data.sub
    except (JWTError, ValueError) as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        ) from e


@router.websocket("/ws/incidents")
async def websocket_incidents(
    websocket: WebSocket,
    user_id: Annotated[str, Depends(get_ws_current_user)]
):
    """
    WebSocket endpoint for real-time incident streaming.
    Requires a valid JWT token via the `?token=` query parameter.
    """
    await websocket.accept()

    # Subscribe to the Redis Pub/Sub generator
    async for message in pubsub_manager.subscribe():
        try:
            await websocket.send_json(message)
        except WebSocketDisconnect:
            break
        except Exception:
            # If the connection drops or fails to send, just break the loop
            break
