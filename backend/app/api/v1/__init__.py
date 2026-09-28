from fastapi import APIRouter
from app.api.v1.endpoints.health import router as health_router
from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.profile import router as profile_router
from app.api.v1.endpoints.tasks import router as tasks_router

api_v1_router = APIRouter()
api_v1_router.include_router(health_router, tags=["Health"])
api_v1_router.include_router(auth_router)
api_v1_router.include_router(profile_router)
api_v1_router.include_router(tasks_router)

__all__ = ["api_v1_router"]
