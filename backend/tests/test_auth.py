import asyncio
from datetime import datetime, timedelta, timezone
import pytest
from httpx import AsyncClient
from sqlalchemy import select

from app.core.security import create_access_token, hash_otp
from app.models.otp import EmailVerificationOTP
from app.models.user import User
from tests.conftest import TestAsyncSessionLocal as AsyncSessionLocal


@pytest.mark.asyncio
async def test_01_successful_registration(async_client: AsyncClient, captured_emails):
    """1. Successful registration creates unverified user and dispatches OTP."""
    response = await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "password": "Password123!",
            "confirm_password": "Password123!",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["is_email_verified"] is False
    assert "password" not in data
    assert "password_hash" not in data

    # Verify email was captured
    assert len(captured_emails) == 1
    assert captured_emails[0]["to"] == "test@example.com"
    assert len(captured_emails[0]["otp"]) == 6


@pytest.mark.asyncio
async def test_02_duplicate_email_registration_rejected(async_client: AsyncClient):
    """2. Duplicate email registration is rejected with 409 Conflict."""
    payload = {
        "email": "duplicate@example.com",
        "password": "Password123!",
        "confirm_password": "Password123!",
    }
    first = await async_client.post("/api/v1/auth/register", json=payload)
    assert first.status_code == 201

    second = await async_client.post("/api/v1/auth/register", json=payload)
    assert second.status_code == 409
    assert "already exists" in second.json()["detail"]


@pytest.mark.asyncio
async def test_03_password_mismatch_rejected(async_client: AsyncClient):
    """3. Password mismatch is rejected at schema validation layer."""
    response = await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "mismatch@example.com",
            "password": "Password123!",
            "confirm_password": "DifferentPassword123!",
        },
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_04_otp_generated_and_stored_only_as_hash(
    async_client: AsyncClient, captured_emails
):
    """4. OTP is generated and stored in the database ONLY as a secure hash."""
    await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "hashcheck@example.com",
            "password": "Password123!",
            "confirm_password": "Password123!",
        },
    )
    raw_otp = captured_emails[0]["otp"]

    async with AsyncSessionLocal() as session:
        stmt = (
            select(EmailVerificationOTP)
            .join(User)
            .where(User.email == "hashcheck@example.com")
        )
        result = await session.execute(stmt)
        otp_record = result.scalar_one()

        # The stored value must NOT be the plaintext OTP
        assert otp_record.otp_hash != raw_otp
        # The stored value must match the HMAC hash of raw OTP
        assert otp_record.otp_hash == hash_otp(raw_otp)


@pytest.mark.asyncio
async def test_05_correct_otp_verifies_email(async_client: AsyncClient, captured_emails):
    """5. Correct OTP verifies the user's email."""
    await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "verifyok@example.com",
            "password": "Password123!",
            "confirm_password": "Password123!",
        },
    )
    raw_otp = captured_emails[0]["otp"]

    verify_res = await async_client.post(
        "/api/v1/auth/verify-email",
        json={
            "email": "verifyok@example.com",
            "otp": raw_otp,
        },
    )
    assert verify_res.status_code == 200
    assert verify_res.json()["is_verified"] is True

    # Check user in DB
    async with AsyncSessionLocal() as session:
        user = (
            await session.execute(
                select(User).where(User.email == "verifyok@example.com")
            )
        ).scalar_one()
        assert user.is_email_verified is True


@pytest.mark.asyncio
async def test_06_incorrect_otp_increments_attempts(
    async_client: AsyncClient, captured_emails
):
    """6. Incorrect OTP increments attempt count and returns remaining attempts."""
    await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "wrongotp@example.com",
            "password": "Password123!",
            "confirm_password": "Password123!",
        },
    )

    bad_res = await async_client.post(
        "/api/v1/auth/verify-email",
        json={
            "email": "wrongotp@example.com",
            "otp": "000000",
        },
    )
    assert bad_res.status_code == 400
    assert "4 attempts remaining" in bad_res.json()["detail"]

    async with AsyncSessionLocal() as session:
        otp_rec = (
            await session.execute(
                select(EmailVerificationOTP)
                .join(User)
                .where(User.email == "wrongotp@example.com")
            )
        ).scalar_one()
        assert otp_rec.attempts_count == 1
        assert otp_rec.is_consumed is False


@pytest.mark.asyncio
async def test_07_fifth_incorrect_attempt_handled_correctly(
    async_client: AsyncClient, captured_emails
):
    """7. Fifth incorrect attempt exhausts the OTP and marks it invalid."""
    await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "attemptlimit@example.com",
            "password": "Password123!",
            "confirm_password": "Password123!",
        },
    )

    for i in range(4):
        res = await async_client.post(
            "/api/v1/auth/verify-email",
            json={"email": "attemptlimit@example.com", "otp": "000000"},
        )
        assert res.status_code == 400
        assert f"{4 - i} attempt" in res.json()["detail"]

    # 5th attempt
    res_5 = await async_client.post(
        "/api/v1/auth/verify-email",
        json={"email": "attemptlimit@example.com", "otp": "000000"},
    )
    assert res_5.status_code == 400
    assert "Maximum verification attempts exceeded" in res_5.json()["detail"]

    async with AsyncSessionLocal() as session:
        otp_rec = (
            await session.execute(
                select(EmailVerificationOTP)
                .join(User)
                .where(User.email == "attemptlimit@example.com")
            )
        ).scalar_one()
        assert otp_rec.attempts_count == 5
        assert otp_rec.is_consumed is True


@pytest.mark.asyncio
async def test_08_otp_cannot_be_used_after_max_attempts(
    async_client: AsyncClient, captured_emails
):
    """8. Even with correct OTP, code cannot be used after max attempts exceeded."""
    await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "exhausted@example.com",
            "password": "Password123!",
            "confirm_password": "Password123!",
        },
    )
    real_otp = captured_emails[0]["otp"]

    # Fail 5 times
    for _ in range(5):
        await async_client.post(
            "/api/v1/auth/verify-email",
            json={"email": "exhausted@example.com", "otp": "999999"},
        )

    # Now attempt with real OTP
    res_real = await async_client.post(
        "/api/v1/auth/verify-email",
        json={"email": "exhausted@example.com", "otp": real_otp},
    )
    assert res_real.status_code == 400
    assert "already been used" in res_real.json()["detail"] or "Maximum verification attempts" in res_real.json()["detail"]


@pytest.mark.asyncio
async def test_09_expired_otp_rejected(async_client: AsyncClient, captured_emails):
    """9. Expired OTP is rejected."""
    await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "expired@example.com",
            "password": "Password123!",
            "confirm_password": "Password123!",
        },
    )
    raw_otp = captured_emails[0]["otp"]

    # Manually backdate expiration in DB to simulate past 10 minutes
    async with AsyncSessionLocal() as session:
        otp_rec = (
            await session.execute(
                select(EmailVerificationOTP)
                .join(User)
                .where(User.email == "expired@example.com")
            )
        ).scalar_one()
        otp_rec.expires_at = datetime.now(timezone.utc) - timedelta(minutes=1)
        await session.commit()

    res = await async_client.post(
        "/api/v1/auth/verify-email",
        json={"email": "expired@example.com", "otp": raw_otp},
    )
    assert res.status_code == 400
    assert "expired" in res.json()["detail"].lower()


@pytest.mark.asyncio
async def test_10_otp_cannot_be_reused_after_verification(
    async_client: AsyncClient, captured_emails
):
    """10. OTP cannot be reused after successful verification (single use)."""
    await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "reused@example.com",
            "password": "Password123!",
            "confirm_password": "Password123!",
        },
    )
    raw_otp = captured_emails[0]["otp"]

    first_use = await async_client.post(
        "/api/v1/auth/verify-email",
        json={"email": "reused@example.com", "otp": raw_otp},
    )
    assert first_use.status_code == 200

    # User is now verified; subsequent attempt is rejected
    second_use = await async_client.post(
        "/api/v1/auth/verify-email",
        json={"email": "reused@example.com", "otp": raw_otp},
    )
    assert second_use.status_code == 400
    assert "already verified" in second_use.json()["detail"].lower()


@pytest.mark.asyncio
async def test_11_resend_cooldown_enforced(async_client: AsyncClient, captured_emails):
    """11. Resend cooldown (approx. 30 seconds) is enforced."""
    await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "cooldown@example.com",
            "password": "Password123!",
            "confirm_password": "Password123!",
        },
    )
    assert len(captured_emails) == 1

    # Immediate resend request must fail with 429 Too Many Requests
    resend_fail = await async_client.post(
        "/api/v1/auth/resend-otp",
        json={"email": "cooldown@example.com"},
    )
    assert resend_fail.status_code == 429
    assert "wait" in resend_fail.json()["detail"].lower()

    # Fast forward last_sent_at by 31 seconds in DB
    async with AsyncSessionLocal() as session:
        otp_rec = (
            await session.execute(
                select(EmailVerificationOTP)
                .join(User)
                .where(User.email == "cooldown@example.com")
            )
        ).scalar_one()
        otp_rec.last_sent_at = datetime.now(timezone.utc) - timedelta(seconds=35)
        await session.commit()

    # Now resend should succeed
    resend_ok = await async_client.post(
        "/api/v1/auth/resend-otp",
        json={"email": "cooldown@example.com"},
    )
    assert resend_ok.status_code == 200
    assert len(captured_emails) == 2


@pytest.mark.asyncio
async def test_12_unverified_user_cannot_login(async_client: AsyncClient):
    """12. Unverified user is rejected with 403 Forbidden on login."""
    await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "unverified@example.com",
            "password": "Password123!",
            "confirm_password": "Password123!",
        },
    )

    login_res = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "unverified@example.com", "password": "Password123!"},
    )
    assert login_res.status_code == 403
    assert "verification required" in login_res.json()["detail"].lower()


@pytest.mark.asyncio
async def test_13_verified_user_can_login(async_client: AsyncClient, captured_emails):
    """13. Verified user can log in with correct password."""
    await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "verifiedlogin@example.com",
            "password": "Password123!",
            "confirm_password": "Password123!",
        },
    )
    raw_otp = captured_emails[0]["otp"]
    await async_client.post(
        "/api/v1/auth/verify-email",
        json={"email": "verifiedlogin@example.com", "otp": raw_otp},
    )

    login_res = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "verifiedlogin@example.com", "password": "Password123!"},
    )
    assert login_res.status_code == 200
    data = login_res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_14_incorrect_password_rejected(async_client: AsyncClient, captured_emails):
    """14. Incorrect password is rejected with 401 Unauthorized."""
    await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "wrongpwd@example.com",
            "password": "Password123!",
            "confirm_password": "Password123!",
        },
    )
    raw_otp = captured_emails[0]["otp"]
    await async_client.post(
        "/api/v1/auth/verify-email",
        json={"email": "wrongpwd@example.com", "otp": raw_otp},
    )

    login_res = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "wrongpwd@example.com", "password": "WrongPassword999!"},
    )
    assert login_res.status_code == 401
    assert "Invalid email or password" in login_res.json()["detail"]


@pytest.mark.asyncio
async def test_15_jwt_issued_after_successful_login(
    async_client: AsyncClient, captured_emails
):
    """15. JWT access token is issued after successful login with expiration metadata."""
    await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "tokenuser@example.com",
            "password": "Password123!",
            "confirm_password": "Password123!",
        },
    )
    raw_otp = captured_emails[0]["otp"]
    await async_client.post(
        "/api/v1/auth/verify-email",
        json={"email": "tokenuser@example.com", "otp": raw_otp},
    )

    res = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "tokenuser@example.com", "password": "Password123!"},
    )
    assert res.status_code == 200
    body = res.json()
    assert len(body["access_token"]) > 20
    assert body["expires_in"] == 1440 * 60


@pytest.mark.asyncio
async def test_16_me_endpoint_rejects_missing_or_invalid_jwt(async_client: AsyncClient):
    """16. Protected /me endpoint rejects missing or invalid JWT."""
    # Missing header
    res_missing = await async_client.get("/api/v1/auth/me")
    assert res_missing.status_code == 401

    # Invalid token string
    res_invalid = await async_client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer completely_bogus_token"},
    )
    assert res_invalid.status_code == 401


@pytest.mark.asyncio
async def test_17_valid_jwt_allows_me_access(async_client: AsyncClient, captured_emails):
    """17. Valid JWT allows /me access and returns safe user profile."""
    reg = await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "meaccess@example.com",
            "password": "Password123!",
            "confirm_password": "Password123!",
        },
    )
    user_id = reg.json()["id"]
    raw_otp = captured_emails[0]["otp"]
    await async_client.post(
        "/api/v1/auth/verify-email",
        json={"email": "meaccess@example.com", "otp": raw_otp},
    )

    login_res = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "meaccess@example.com", "password": "Password123!"},
    )
    token = login_res.json()["access_token"]

    me_res = await async_client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_res.status_code == 200
    data = me_res.json()
    assert data["id"] == user_id
    assert data["email"] == "meaccess@example.com"
    assert data["is_email_verified"] is True
    assert "password" not in data


@pytest.mark.asyncio
async def test_18_expired_jwt_rejected(async_client: AsyncClient, captured_emails):
    """18. Expired JWT is rejected with 401 Unauthorized."""
    reg = await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "expiredjwt@example.com",
            "password": "Password123!",
            "confirm_password": "Password123!",
        },
    )
    user_id = reg.json()["id"]

    # Issue an already expired JWT
    expired_token = create_access_token(
        subject=user_id,
        expires_delta=timedelta(seconds=-10),
    )

    me_res = await async_client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {expired_token}"},
    )
    assert me_res.status_code == 401
    assert "expired" in me_res.json()["detail"].lower()
