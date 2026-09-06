"""
JEEVAN AI — Redis Pub/Sub Manager

Manages real-time message broadcasting across FastAPI workers using Redis.
"""
import asyncio
import json
import logging
from typing import Any

from redis.asyncio import Redis, from_url

from app.core.config import settings

logger = logging.getLogger(__name__)


class PubSubManager:
    """Manages Redis connection and Pub/Sub channels."""

    def __init__(self) -> None:
        self.redis: Redis | None = None
        self.channel = "jeevan-incidents"

    async def connect(self) -> None:
        """Initialize Redis connection."""
        try:
            self.redis = from_url(settings.REDIS_URL, decode_responses=True)
            # Ping to verify connection
            await self.redis.ping()
            logger.info("Connected to Redis Pub/Sub successfully.")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            self.redis = None

    async def close(self) -> None:
        """Close Redis connection."""
        if self.redis:
            await self.redis.aclose()

    async def publish_incident(self, message: dict[str, Any]) -> None:
        """Publish an incident update to the channel."""
        await self.publish(self.channel, json.dumps(message))

    async def publish(self, channel: str, message: str) -> None:
        """Generic publish method."""
        if self.redis:
            try:
                await self.redis.publish(channel, message)
            except Exception as e:
                logger.error(f"Failed to publish to Redis: {e}")

    async def subscribe(self):
        """Subscribe to the channel and yield messages as an async generator."""
        if not self.redis:
            logger.warning("Redis not connected, yielding mock messages for dev mode.")
            # Fallback for dev mode when Redis is not running
            while True:
                await asyncio.sleep(60)
                yield {"type": "ping", "data": "keep-alive"}

        pubsub = self.redis.pubsub()
        await pubsub.subscribe(self.channel)

        try:
            async for message in pubsub.listen():
                if message["type"] == "message":
                    try:
                        data = json.loads(message["data"])
                        yield data
                    except json.JSONDecodeError:
                        logger.error("Failed to decode message from Redis")
        finally:
            await pubsub.unsubscribe(self.channel)
            await pubsub.close()


# Global instance
pubsub_manager = PubSubManager()
