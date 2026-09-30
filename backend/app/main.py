from contextlib import asynccontextmanager
from typing import AsyncGenerator
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.routes import api_router
from app.core.config import settings
from app.db.session import get_db
from app.schemas.health import HealthResponse


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    # Lifespan startup: seed demo user if not present
    try:
        from seed_demo_user import seed_demo_user
        await seed_demo_user()
    except Exception as e:
        print(f"Startup seed notice: {e}")
    yield
    # Lifespan shutdown


def create_application() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version="0.1.0",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
        lifespan=lifespan,
    )

    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Root /health endpoint
    @app.get(
        "/health",
        response_model=HealthResponse,
        tags=["Health"],
        summary="Service Health Status",
    )
    async def root_health(
        session: AsyncSession = Depends(get_db),
    ) -> HealthResponse:
        db_status = "connected"
        try:
            await session.execute(text("SELECT 1"))
        except Exception:
            db_status = "disconnected"

        return HealthResponse(
            status="ok",
            environment=settings.ENVIRONMENT,
            version="0.1.0",
            database=db_status,
        )

    # Root info
    @app.get("/", tags=["Root"], include_in_schema=False)
    async def root():
        return {
            "name": settings.PROJECT_NAME,
            "version": "0.1.0",
            "docs": "/docs",
            "health": "/health",
        }

    # Mount API routers
    app.include_router(api_router)

    return app


app = create_application()

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
