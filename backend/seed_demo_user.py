import asyncio
import uuid
from sqlalchemy import select
from app.db.session import AsyncSessionLocal
from app.models.user import User
from app.models.profile import UserProfile
from app.core.security import get_password_hash

async def seed_demo_user():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).where(User.email == "test@example.com"))
        user = result.scalars().first()
        if not user:
            user = User(
                id=uuid.uuid4(),
                email="test@example.com",
                password_hash=get_password_hash("Password123!"),
                is_email_verified=True,
            )
            session.add(user)
            await session.flush()

            profile = UserProfile(
                id=uuid.uuid4(),
                user_id=user.id,
                full_name="Rahul Sharma",
                phone_number="+919876543210",
                address="Flat 402, Sunshine Heights, MG Road, Bengaluru",
                business_name="Sharma Pro Maintenance",
            )
            session.add(profile)
            await session.commit()
            print("Successfully seeded demo user test@example.com with profile!")
        else:
            print("Demo user test@example.com already exists.")

if __name__ == "__main__":
    asyncio.run(seed_demo_user())
