import re
import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator


INDIAN_MOBILE_REGEX = re.compile(r"^(?:\+91|0)?[6-9]\d{9}$")


def normalize_indian_mobile(phone: str) -> str:
    """
    Validates and normalizes an Indian 10-digit mobile number to +91XXXXXXXXXX format.
    Accepts:
      - 9876543210
      - +919876543210
      - +91 98765 43210
      - +91-98765-43210
      - 09876543210
    """
    cleaned = re.sub(r"[\s\-()]", "", phone.strip())
    if not INDIAN_MOBILE_REGEX.match(cleaned):
        raise ValueError(
            "Invalid Indian mobile number. Must be a 10-digit number starting with 6, 7, 8, or 9 (e.g., +91 98765 43210)."
        )

    # Extract the 10 digits
    if cleaned.startswith("+91"):
        ten_digits = cleaned[3:]
    elif cleaned.startswith("0"):
        ten_digits = cleaned[1:]
    else:
        ten_digits = cleaned

    return f"+91{ten_digits}"


class ProfileCreateRequest(BaseModel):
    full_name: str = Field(
        min_length=2,
        max_length=100,
        description="Full Name of the user/service pro",
    )
    phone_number: str = Field(
        description="Indian mobile number (10 digits, +91)",
    )
    address: str = Field(
        min_length=5,
        max_length=500,
        description="Full street address and city",
    )
    business_name: Optional[str] = Field(
        default=None,
        max_length=150,
        description="Optional registered business or trade name",
    )

    @field_validator("full_name", mode="after")
    @classmethod
    def clean_name(cls, v: str) -> str:
        cleaned = v.strip()
        if len(cleaned) < 2:
            raise ValueError("Full name must contain at least 2 characters.")
        return cleaned

    @field_validator("phone_number", mode="after")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        return normalize_indian_mobile(v)

    @field_validator("address", mode="after")
    @classmethod
    def clean_address(cls, v: str) -> str:
        cleaned = v.strip()
        if len(cleaned) < 5:
            raise ValueError("Address must contain at least 5 characters.")
        return cleaned

    @field_validator("business_name", mode="after")
    @classmethod
    def clean_business_name(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        cleaned = v.strip()
        return cleaned if cleaned else None


class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=100,
        description="Full Name",
    )
    phone_number: Optional[str] = Field(
        default=None,
        description="Indian mobile number",
    )
    address: Optional[str] = Field(
        default=None,
        min_length=5,
        max_length=500,
        description="Address",
    )
    business_name: Optional[str] = Field(
        default=None,
        max_length=150,
        description="Optional business name",
    )

    @field_validator("phone_number", mode="after")
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        return normalize_indian_mobile(v)


class ProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    full_name: str
    phone_number: str
    address: str
    business_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime
