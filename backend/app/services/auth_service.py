import logging
from typing import Optional, Tuple
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    ResendOtpRequest,
    TokenResponse,
    VerifyEmailRequest,
)
from app.services.email_service import email_service
from app.services.otp_service import otp_service

logger = logging.getLogger(__name__)


class AuthService:
    @staticmethod
    async def get_user_by_email(session: AsyncSession, email: str) -> Optional[User]:
        stmt = select(User).where(User.email == email.strip().lower())
        result = await session.execute(stmt)
        return result.scalar_one_or_none()

    @classmethod
    async def register(
        cls,
        session: AsyncSession,
        req: RegisterRequest,
    ) -> User:
        normalized_email = req.email.strip().lower()

        # Check duplicate
        existing = await cls.get_user_by_email(session, normalized_email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email address already exists.",
            )

        # Hash password with Argon2id
        hashed_password = get_password_hash(req.password)

        user = User(
            email=normalized_email,
            password_hash=hashed_password,
            is_email_verified=False,
        )
        session.add(user)
        await session.flush()

        # Generate OTP & store hash
        plain_otp, _ = await otp_service.create_otp(session, user.id)

        # Dispatch email
        await email_service.send_otp_email(user.email, plain_otp)

        await session.commit()
        await session.refresh(user)
        return user

    @classmethod
    async def verify_email(
        cls,
        session: AsyncSession,
        req: VerifyEmailRequest,
    ) -> User:
        normalized_email = req.email.strip().lower()
        user = await cls.get_user_by_email(session, normalized_email)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No account found associated with this email address.",
            )

        if user.is_email_verified:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This email address is already verified. You may proceed to login.",
            )

        is_valid, message = await otp_service.verify_otp(session, user.id, req.otp)

        if not is_valid:
            await session.commit()  # Commit incremented attempt count
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=message,
            )

        user.is_email_verified = True
        await session.commit()
        await session.refresh(user)
        return user

    @classmethod
    async def resend_otp(
        cls,
        session: AsyncSession,
        req: ResendOtpRequest,
    ) -> None:
        normalized_email = req.email.strip().lower()
        user = await cls.get_user_by_email(session, normalized_email)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No account found associated with this email address.",
            )

        if user.is_email_verified:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This email address is already verified.",
            )

        # Enforce cooldown
        cooldown_remaining = await otp_service.check_resend_cooldown(session, user.id)
        if cooldown_remaining is not None:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Please wait {cooldown_remaining} second{'s' if cooldown_remaining != 1 else ''} before requesting a new code.",
            )

        # Generate new OTP (invalidates previous)
        plain_otp, _ = await otp_service.create_otp(session, user.id)

        # Send via email
        await email_service.send_otp_email(user.email, plain_otp)
        await session.commit()

    @classmethod
    async def login(
        cls,
        session: AsyncSession,
        req: LoginRequest,
    ) -> TokenResponse:
        normalized_email = req.email.strip().lower()
        user = await cls.get_user_by_email(session, normalized_email)

        # Constant-time comparison / generic failure for invalid credentials
        if not user or not verify_password(req.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Verification check
        if not user.is_email_verified:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Email verification required. Please verify your email before logging in.",
            )

        access_token = create_access_token(subject=str(user.id))
        expires_in = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60

        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=expires_in,
        )


auth_service = AuthService()
