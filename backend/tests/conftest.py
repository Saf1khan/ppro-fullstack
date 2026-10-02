from typing import AsyncGenerator, Dict, List
import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from app.core.config import settings
from app.db.session import get_db
from app.main import app
from app.services.email_service import email_service

# Create test-dedicated async engine using NullPool so connections are not leaked
# across different pytest-asyncio event loops.
test_engine = create_async_engine(
    settings.DATABASE_URL,
    poolclass=NullPool,
    echo=False,
)

TestAsyncSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
    async with TestAsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
async def clean_db_tables():
    """Ensures each test starts with a clean database state."""
    async with TestAsyncSessionLocal() as session:
        await session.execute(
            text("TRUNCATE TABLE user_task_selections, user_profiles, email_verification_otps, users CASCADE;")
        )
        await session.commit()
    yield
    async with TestAsyncSessionLocal() as session:
        await session.execute(
            text("TRUNCATE TABLE user_task_selections, user_profiles, email_verification_otps, users CASCADE;")
        )
        await session.commit()


@pytest.fixture(scope="session", autouse=True)
def reseed_demo_user_after_all_tests():
    """Reseeds the demo user once the entire test suite completes so the app is always immediately testable."""
    yield
    try:
        import asyncio
        from seed_demo_user import seed_demo_user
        asyncio.run(seed_demo_user())
    except Exception as e:
        pass


@pytest.fixture(autouse=True)
def captured_emails(monkeypatch) -> List[Dict[str, str]]:
    """
    Mocks out email sending and captures outgoing OTP emails in an in-memory list
    for verification in tests.
    """
    sent_emails: List[Dict[str, str]] = []

    async def mock_send(to_email: str, otp_code: str) -> bool:
        sent_emails.append({"to": to_email, "otp": otp_code})
        return True

    monkeypatch.setattr(email_service, "send_otp_email", mock_send)
    return sent_emails


@pytest.fixture
async def async_client() -> AsyncGenerator[AsyncClient, None]:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        yield client
