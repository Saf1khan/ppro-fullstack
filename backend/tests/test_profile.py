import pytest
from httpx import AsyncClient

from tests.conftest import TestAsyncSessionLocal as AsyncSessionLocal


async def register_verify_and_login(client: AsyncClient, email: str = "pro@example.com", password: str = "Password123!") -> str:
    """Helper that registers, captures OTP, verifies email, and logs in."""
    # 1. Register
    reg_resp = await client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "confirm_password": password},
    )
    assert reg_resp.status_code == 201

    # 2. Get user and verify OTP from DB or via email
    from app.models.user import User
    from app.models.otp import EmailVerificationOTP
    from sqlalchemy import select

    async with AsyncSessionLocal() as session:
        user_stmt = select(User).where(User.email == email)
        user = (await session.execute(user_stmt)).scalar_one()
        user.is_email_verified = True
        await session.commit()

    # 3. Login
    login_resp = await client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    assert login_resp.status_code == 200
    return login_resp.json()["access_token"]


@pytest.mark.asyncio
async def test_01_profile_me_requires_auth(async_client: AsyncClient):
    """Accessing /profile/me without token returns 401 Unauthorized."""
    resp = await async_client.get("/api/v1/profile/me")
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_02_profile_me_not_found_returns_404(async_client: AsyncClient):
    """When a new user has no profile yet, GET /profile/me returns 404."""
    token = await register_verify_and_login(async_client, "newuser@example.com")
    resp = await async_client.get(
        "/api/v1/profile/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 404
    assert "Profile not found" in resp.json()["detail"]


@pytest.mark.asyncio
async def test_03_create_profile_success(async_client: AsyncClient):
    """Successfully creates a profile with Indian phone normalization."""
    token = await register_verify_and_login(async_client, "provider@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "full_name": "Ramesh Kumar",
        "phone_number": "9876543210",  # Raw 10 digits
        "address": "42, Green Park Main, South Delhi, New Delhi 110016",
        "business_name": "Kumar Plumbing & Electric",
    }
    resp = await async_client.post("/api/v1/profile", json=payload, headers=headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["full_name"] == "Ramesh Kumar"
    assert data["phone_number"] == "+919876543210"  # Normalized to +91
    assert data["address"] == "42, Green Park Main, South Delhi, New Delhi 110016"
    assert data["business_name"] == "Kumar Plumbing & Electric"
    assert "id" in data
    assert "user_id" in data


@pytest.mark.asyncio
async def test_04_create_profile_without_business_name_allowed(async_client: AsyncClient):
    """Business Name is optional for individual service providers."""
    token = await register_verify_and_login(async_client, "solo@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "full_name": "Sita Sharma",
        "phone_number": "+91 9123456780",
        "address": "Flat 302, Sunrise Towers, Indiranagar, Bengaluru 560038",
        "business_name": None,
    }
    resp = await async_client.post("/api/v1/profile", json=payload, headers=headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["full_name"] == "Sita Sharma"
    assert data["phone_number"] == "+919123456780"
    assert data["business_name"] is None


@pytest.mark.asyncio
async def test_05_invalid_indian_phone_rejected(async_client: AsyncClient):
    """Non-Indian or invalid length phone number is rejected with 422."""
    token = await register_verify_and_login(async_client, "badphone@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    invalid_phones = [
        "1234567890",       # Starts with 1 (not 6-9)
        "987654321",        # Only 9 digits
        "+12025550123",     # US number
        "abcdefghij",       # Alphabetic
    ]

    for bad in invalid_phones:
        resp = await async_client.post(
            "/api/v1/profile",
            json={
                "full_name": "Test User",
                "phone_number": bad,
                "address": "Valid Address Street 123",
            },
            headers=headers,
        )
        assert resp.status_code == 422


@pytest.mark.asyncio
async def test_06_duplicate_profile_creation_rejected(async_client: AsyncClient):
    """A user cannot create a second profile (1-to-1 constraint enforced)."""
    token = await register_verify_and_login(async_client, "duplicate@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "full_name": "Arun Patel",
        "phone_number": "9898989898",
        "address": "15, Navrangpura, Ahmedabad 380009",
    }
    first = await async_client.post("/api/v1/profile", json=payload, headers=headers)
    assert first.status_code == 201

    # Second attempt should return 409 Conflict
    second = await async_client.post("/api/v1/profile", json=payload, headers=headers)
    assert second.status_code == 409
    assert "already exists" in second.json()["detail"]


@pytest.mark.asyncio
async def test_07_update_profile_success(async_client: AsyncClient):
    """User can update their profile via PUT /api/v1/profile."""
    token = await register_verify_and_login(async_client, "update@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    create_payload = {
        "full_name": "Pooja Hegde",
        "phone_number": "9811122233",
        "address": "Old Address, Sector 14, Gurgaon",
        "business_name": "Old Business",
    }
    await async_client.post("/api/v1/profile", json=create_payload, headers=headers)

    update_payload = {
        "address": "New Address, Sector 29, Gurgaon 122002",
        "business_name": "Pooja Professional Home Care",
    }
    resp = await async_client.put("/api/v1/profile", json=update_payload, headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["address"] == "New Address, Sector 29, Gurgaon 122002"
    assert data["business_name"] == "Pooja Professional Home Care"
    assert data["full_name"] == "Pooja Hegde"  # Preserved


@pytest.mark.asyncio
async def test_08_auth_me_reflects_has_profile_status(async_client: AsyncClient):
    """GET /api/v1/auth/me accurately reports has_profile False then True."""
    token = await register_verify_and_login(async_client, "profilecheck@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    # Before profile creation
    me_resp1 = await async_client.get("/api/v1/auth/me", headers=headers)
    assert me_resp1.status_code == 200
    assert me_resp1.json()["has_profile"] is False

    # Create profile
    await async_client.post(
        "/api/v1/profile",
        json={
            "full_name": "Test Check",
            "phone_number": "9876500000",
            "address": "Sample Address Street 10",
        },
        headers=headers,
    )

    # After profile creation
    me_resp2 = await async_client.get("/api/v1/auth/me", headers=headers)
    assert me_resp2.status_code == 200
    assert me_resp2.json()["has_profile"] is True
