import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import hash_otp, verify_otp_hash
from app.models.otp import EmailVerificationOTP


class OTPService:
    @staticmethod
    def generate_numeric_otp() -> str:
        """Generates a cryptographically secure 6-digit numeric OTP."""
        # secrets.randbelow(900000) produces 0..899999; + 100000 produces 100000..999999
        return str(secrets.randbelow(900000) + 100000)

    @classmethod
    async def create_otp(
        cls,
        session: AsyncSession,
        user_id: uuid.UUID,
    ) -> Tuple[str, EmailVerificationOTP]:
        """
        Invalidates existing active OTPs for the user, creates a new hashed OTP record,
        and returns (plain_otp, otp_record).
        The plain OTP is returned only for delivery to the email transport, never stored.
        """
        now = datetime.now(timezone.utc)
        expires_at = now + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)

        # Mark all prior active OTPs for this user as consumed
        existing_stmt = select(EmailVerificationOTP).where(
            EmailVerificationOTP.user_id == user_id,
            EmailVerificationOTP.is_consumed == False,  # noqa: E712
        )
        existing_result = await session.execute(existing_stmt)
        for old_otp in existing_result.scalars().all():
            old_otp.is_consumed = True

        plain_otp = cls.generate_numeric_otp()
        otp_record = EmailVerificationOTP(
            user_id=user_id,
            otp_hash=hash_otp(plain_otp),
            expires_at=expires_at,
            is_consumed=False,
            attempts_count=0,
            last_sent_at=now,
            created_at=now,
        )
        session.add(otp_record)
        await session.flush()
        return plain_otp, otp_record

    @classmethod
    async def check_resend_cooldown(
        cls,
        session: AsyncSession,
        user_id: uuid.UUID,
    ) -> Optional[int]:
        """
        Checks if the user must wait before requesting a new OTP.
        Returns the number of seconds remaining if in cooldown, or None if allowed.
        """
        stmt = (
            select(EmailVerificationOTP)
            .where(EmailVerificationOTP.user_id == user_id)
            .order_by(desc(EmailVerificationOTP.last_sent_at))
            .limit(1)
        )
        result = await session.execute(stmt)
        latest_otp = result.scalar_one_or_none()

        if latest_otp:
            now = datetime.now(timezone.utc)
            # Ensure latest_otp.last_sent_at is timezone-aware
            last_sent = latest_otp.last_sent_at
            if last_sent.tzinfo is None:
                last_sent = last_sent.replace(tzinfo=timezone.utc)

            elapsed = (now - last_sent).total_seconds()
            cooldown = settings.OTP_RESEND_COOLDOWN_SECONDS
            if elapsed < cooldown:
                return int(cooldown - elapsed)
        return None

    @classmethod
    async def verify_otp(
        cls,
        session: AsyncSession,
        user_id: uuid.UUID,
        plain_otp: str,
    ) -> Tuple[bool, str]:
        """
        Validates the provided OTP for a user:
        - Must exist and not be consumed
        - Must not be expired
        - Must not exceed max attempts (5)
        - On success: marks consumed and returns (True, "Success")
        - On mismatch: increments attempt count and returns (False, error_reason)
        """
        stmt = (
            select(EmailVerificationOTP)
            .where(
                EmailVerificationOTP.user_id == user_id,
            )
            .order_by(desc(EmailVerificationOTP.created_at))
            .limit(1)
        )
        result = await session.execute(stmt)
        otp_record = result.scalar_one_or_none()

        if not otp_record:
            return False, "No verification code found. Please request a new one."

        if otp_record.is_consumed:
            return False, "This verification code has already been used. Please request a new one."

        now = datetime.now(timezone.utc)
        expires_at = otp_record.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)

        if now > expires_at:
            otp_record.is_consumed = True
            await session.flush()
            return False, "Verification code has expired. Please request a new one."

        if otp_record.attempts_count >= settings.OTP_MAX_ATTEMPTS:
            otp_record.is_consumed = True
            await session.flush()
            return (
                False,
                "Maximum verification attempts exceeded. This code is no longer valid. Please request a new one.",
            )

        # Constant-time comparison
        is_match = verify_otp_hash(plain_otp, otp_record.otp_hash)

        if not is_match:
            otp_record.attempts_count += 1
            remaining = settings.OTP_MAX_ATTEMPTS - otp_record.attempts_count
            if otp_record.attempts_count >= settings.OTP_MAX_ATTEMPTS:
                otp_record.is_consumed = True
                await session.flush()
                return (
                    False,
                    "Maximum verification attempts exceeded. This code is no longer valid. Please request a new one.",
                )
            await session.flush()
            return (
                False,
                f"Incorrect verification code. {remaining} attempt{'s' if remaining != 1 else ''} remaining.",
            )

        # Successful verification
        otp_record.is_consumed = True
        await session.flush()
        return True, "Email verified successfully."


otp_service = OTPService()
