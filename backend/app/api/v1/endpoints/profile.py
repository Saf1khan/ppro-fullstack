from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.profile import (
    ProfileCreateRequest,
    ProfileUpdateRequest,
    ProfileResponse,
)
from app.services.profile_service import profile_service

router = APIRouter(prefix="/profile", tags=["Profile"])


@router.get(
    "/me",
    response_model=ProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current user profile",
    description="Returns the saved profile details for the authenticated user.",
)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> ProfileResponse:
    profile = await profile_service.get_profile(session, current_user.id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found. Please complete first-login onboarding.",
        )
    return ProfileResponse.model_validate(profile)


@router.post(
    "",
    response_model=ProfileResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create user profile",
    description="Saves Name, Indian Mobile Number (+91), Address, and optional Business Name.",
)
async def create_profile(
    req: ProfileCreateRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> ProfileResponse:
    profile = await profile_service.create_profile(session, current_user, req)
    return ProfileResponse.model_validate(profile)


@router.put(
    "",
    response_model=ProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="Update user profile",
    description="Updates the profile details for the authenticated user.",
)
async def update_profile(
    req: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> ProfileResponse:
    profile = await profile_service.update_profile(session, current_user.id, req)
    return ProfileResponse.model_validate(profile)
