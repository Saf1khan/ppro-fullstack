import uuid
from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User


class EmailVerificationOTP(Base):
    __tablename__ = "email_verification_otps"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    otp_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True,
    )
    is_consumed: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )
    attempts_count: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )
    last_sent_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    user: Mapped["User"] = relationship(
        "User",
        back_populates="otps",
    )

    def __repr__(self) -> str:
        return (
            f"<EmailVerificationOTP id={self.id} user_id={self.user_id} "
            f"consumed={self.is_consumed} attempts={self.attempts_count}>"
        )
