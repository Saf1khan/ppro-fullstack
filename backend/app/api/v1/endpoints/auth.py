from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import (
    AuthMessageResponse,
    LoginRequest,
    RegisterRequest,
    ResendOtpRequest,
    TokenResponse,
    UserResponse,
    VerifyEmailRequest,
)
from app.services.auth_service import auth_service
from app.services.profile_service import profile_service

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Registers an unverified user account, hashes the password with Argon2id, generates a secure 6-digit OTP, and emails it.",
)
async def register(
    req: RegisterRequest,
    session: AsyncSession = Depends(get_db),
) -> UserResponse:
    user = await auth_service.register(session, req)
    return UserResponse.model_validate(user)


@router.post(
    "/verify-email",
    response_model=AuthMessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Verify email using OTP",
    description="Verifies the 6-digit OTP sent to the user's email. Enforces 10-minute expiry, single-use, and max 5 attempts.",
)
async def verify_email(
    req: VerifyEmailRequest,
    session: AsyncSession = Depends(get_db),
) -> AuthMessageResponse:
    user = await auth_service.verify_email(session, req)
    return AuthMessageResponse(
        message="Email verified successfully. You may now log in.",
        email=user.email,
        is_verified=user.is_email_verified,
    )


@router.post(
    "/resend-otp",
    response_model=AuthMessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Resend verification OTP",
    description="Generates and dispatches a new 6-digit OTP. Enforces a 30-second cooldown between requests and invalidates previous active OTPs.",
)
async def resend_otp(
    req: ResendOtpRequest,
    session: AsyncSession = Depends(get_db),
) -> AuthMessageResponse:
    await auth_service.resend_otp(session, req)
    return AuthMessageResponse(
        message="A new verification code has been sent to your email address.",
        email=req.email,
    )


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="User login",
    description="Authenticates verified user credentials and returns a signed JWT access token.",
)
async def login(
    req: LoginRequest,
    session: AsyncSession = Depends(get_db),
) -> TokenResponse:
    return await auth_service.login(session, req)


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current user profile",
    description="Returns the profile and verification status of the currently authenticated user.",
)
async def get_me(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> UserResponse:
    profile = await profile_service.get_profile(session, current_user.id)
    resp = UserResponse.model_validate(current_user)
    resp.has_profile = profile is not None
    return resp
