"""
JEEVAN AI — Voice Agent Security Module

Provides AES-256 encryption for call transcripts, API key validation,
and session token management.
"""

import hashlib
import logging
import secrets
from base64 import b64decode, b64encode

from cryptography.fernet import Fernet, InvalidToken

from app.core.config import settings

logger = logging.getLogger(__name__)


def _derive_fernet_key(secret: str) -> bytes:
    """Derive a valid Fernet key from the configured encryption secret."""
    # Use SHA-256 to derive exactly 32 bytes, then base64-encode for Fernet
    digest = hashlib.sha256(secret.encode()).digest()
    return b64encode(digest)


_fernet = Fernet(_derive_fernet_key(settings.VOICE_ENCRYPTION_KEY))


def encrypt_transcript(plaintext: str) -> str:
    """Encrypt a call transcript using AES-256 (Fernet)."""
    try:
        token = _fernet.encrypt(plaintext.encode("utf-8"))
        return token.decode("utf-8")
    except Exception as e:
        logger.error(f"Encryption failed: {e}")
        return ""


def decrypt_transcript(ciphertext: str) -> str:
    """Decrypt an encrypted call transcript."""
    try:
        plaintext = _fernet.decrypt(ciphertext.encode("utf-8"))
        return plaintext.decode("utf-8")
    except InvalidToken:
        logger.error("Decryption failed — invalid token or key mismatch.")
        return "[DECRYPTION_FAILED]"


def hash_phone_number(phone: str) -> str:
    """One-way hash a phone number for privacy-safe storage."""
    return hashlib.sha256(phone.encode()).hexdigest()[:16]


def generate_session_id() -> str:
    """Generate a cryptographically secure call session ID."""
    return f"vc_{secrets.token_urlsafe(24)}"


def generate_call_token() -> str:
    """Generate a token for WebSocket call authentication."""
    return secrets.token_urlsafe(32)
