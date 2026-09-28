import hashlib
import hmac
from datetime import datetime, timedelta, timezone
from typing import Any, Optional, Union
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from jose import JWTError, jwt

from app.core.config import settings

# Initialize Argon2id password hasher (recommended modern password hashing algorithm)
_password_hasher = PasswordHasher()


def get_password_hash(password: str) -> str:
    """Hashes a plaintext password using Argon2id."""
    return _password_hasher.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plaintext password against its Argon2id hash."""
    try:
        return _password_hasher.verify(hashed_password, plain_password)
    except VerifyMismatchError:
        return False
    except Exception:
        return False


def hash_otp(otp: str) -> str:
    """
    Hashes a 6-digit OTP using HMAC-SHA256 with a server secret salt.
    Since 6-digit OTPs have a small space (10^6), HMAC with a secret salt
    protects against rainbow tables and offline dictionary searches if DB is compromised.
    """
    key = settings.OTP_SECRET_SALT.encode("utf-8")
    message = otp.strip().encode("utf-8")
    return hmac.new(key, message, hashlib.sha256).hexdigest()


def verify_otp_hash(plain_otp: str, stored_hash: str) -> bool:
    """
    Verifies a plain 6-digit OTP against the stored hash in constant time
    to prevent timing side-channel attacks.
    """
    computed_hash = hash_otp(plain_otp)
    return hmac.compare_digest(computed_hash, stored_hash)


def create_access_token(
    subject: Union[str, Any],
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Creates a signed JSON Web Token (JWT) with expiration."""
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode = {
        "sub": str(subject),
        "iat": now,
        "exp": expire,
        "type": "access",
    }
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    """Decodes and validates a JWT token. Returns payload dict or None if invalid/expired."""
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        return payload
    except JWTError:
        return None
