import uuid
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.profile import UserProfile
from app.models.user import User
from app.schemas.profile import ProfileCreateRequest, ProfileUpdateRequest


class ProfileService:
    async def get_profile(
        self,
        session: AsyncSession,
        user_id: uuid.UUID,
    ) -> Optional[UserProfile]:
        """Fetches the profile for a given user ID."""
        stmt = select(UserProfile).where(UserProfile.user_id == user_id)
        result = await session.execute(stmt)
        return result.scalar_one_or_none()

    async def create_profile(
        self,
        session: AsyncSession,
        user: User,
        req: ProfileCreateRequest,
    ) -> UserProfile:
        """
        Creates a profile for the user.
        Enforces 1-to-1 profile constraint: a user can only create one profile.
        """
        existing = await self.get_profile(session, user.id)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User profile already exists. Use PUT /api/v1/profile to update details.",
            )

        profile = UserProfile(
            user_id=user.id,
            full_name=req.full_name,
            phone_number=req.phone_number,
            address=req.address,
            business_name=req.business_name,
        )
        session.add(profile)
        await session.commit()
        await session.refresh(profile)
        return profile

    async def update_profile(
        self,
        session: AsyncSession,
        user_id: uuid.UUID,
        req: ProfileUpdateRequest,
    ) -> UserProfile:
        """Updates the profile details for a given user."""
        profile = await self.get_profile(session, user_id)
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found. Please create your profile first.",
            )

        if req.full_name is not None:
            profile.full_name = req.full_name.strip()
        if req.phone_number is not None:
            profile.phone_number = req.phone_number
        if req.address is not None:
            profile.address = req.address.strip()
        if req.business_name is not None:
            profile.business_name = req.business_name.strip() if req.business_name.strip() else None

        await session.commit()
        await session.refresh(profile)
        return profile


profile_service = ProfileService()
