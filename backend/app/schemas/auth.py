import re
import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator


class RegisterRequest(BaseModel):
    email: EmailStr = Field(description="User email address")
    password: str = Field(min_length=8, max_length=128, description="Password (min 8 chars)")
    confirm_password: str = Field(min_length=8, max_length=128, description="Password confirmation")

    @field_validator("email", mode="after")
    @classmethod
    def normalize_email(cls, v: EmailStr) -> str:
        return str(v).strip().lower()

    @model_validator(mode="after")
    def passwords_match(self) -> "RegisterRequest":
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self


class VerifyEmailRequest(BaseModel):
    email: EmailStr = Field(description="User email address")
    otp: str = Field(
        min_length=6,
        max_length=6,
        description="6-digit verification code",
    )

    @field_validator("email", mode="after")
    @classmethod
    def normalize_email(cls, v: EmailStr) -> str:
        return str(v).strip().lower()

    @field_validator("otp", mode="after")
    @classmethod
    def validate_otp_format(cls, v: str) -> str:
        cleaned = v.strip()
        if not re.match(r"^\d{6}$", cleaned):
            raise ValueError("OTP must consist of exactly 6 digits")
        return cleaned


class ResendOtpRequest(BaseModel):
    email: EmailStr = Field(description="User email address")

    @field_validator("email", mode="after")
    @classmethod
    def normalize_email(cls, v: EmailStr) -> str:
        return str(v).strip().lower()


class LoginRequest(BaseModel):
    email: EmailStr = Field(description="User email address")
    password: str = Field(min_length=1, description="Account password")

    @field_validator("email", mode="after")
    @classmethod
    def normalize_email(cls, v: EmailStr) -> str:
        return str(v).strip().lower()


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: str
    is_email_verified: bool
    created_at: datetime


class AuthMessageResponse(BaseModel):
    message: str
    email: Optional[str] = None
    is_verified: Optional[bool] = None
