from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.session import get_db
from app.schemas.health import HealthResponse

router = APIRouter()


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health Check",
    description="Returns current service status, environment, database connectivity, and timestamp.",
)
async def health_check(
    session: Optional[AsyncSession] = Depends(get_db),
) -> HealthResponse:
    db_status = "connected"
    if session:
        try:
            await session.execute(text("SELECT 1"))
        except Exception:
            db_status = "disconnected"
    else:
        db_status = "unavailable"

    return HealthResponse(
        status="ok",
        environment=settings.ENVIRONMENT,
        version="0.1.0",
        database=db_status,
    )
