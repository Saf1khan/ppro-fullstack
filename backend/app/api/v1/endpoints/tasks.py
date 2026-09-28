from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.task import (
    CategoryWithTasksResponse,
    SelectTasksRequest,
    SelectedTasksListResponse,
    TaskResponse,
)
from app.services.task_service import task_service

router = APIRouter(prefix="/tasks", tags=["Task Catalogue & Selection"])


@router.get(
    "/categories",
    response_model=List[CategoryWithTasksResponse],
    status_code=status.HTTP_200_OK,
    summary="Get task catalogue grouped by category",
    description="Returns all service categories with their nested tasks, seeded with at least 20 tasks across 4 categories.",
)
async def get_categories_catalogue(
    session: AsyncSession = Depends(get_db),
) -> List[CategoryWithTasksResponse]:
    categories = await task_service.get_categories_with_tasks(session)
    return [CategoryWithTasksResponse.model_validate(c) for c in categories]


@router.get(
    "",
    response_model=List[TaskResponse],
    status_code=status.HTTP_200_OK,
    summary="Search and list tasks",
    description="Searches tasks by name, category, or description query string.",
)
async def search_tasks(
    search: Optional[str] = Query(None, description="Search query string"),
    session: AsyncSession = Depends(get_db),
) -> List[TaskResponse]:
    tasks = await task_service.search_tasks(session, search)
    return [TaskResponse.model_validate(t) for t in tasks]


@router.post(
    "/select",
    response_model=SelectedTasksListResponse,
    status_code=status.HTTP_200_OK,
    summary="Save user selected tasks",
    description="Persists the list of tasks selected by the authenticated user.",
)
async def select_user_tasks(
    req: SelectTasksRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> SelectedTasksListResponse:
    tasks = await task_service.select_tasks(session, current_user.id, req.task_ids)
    return SelectedTasksListResponse(
        total_count=len(tasks),
        tasks=[TaskResponse.model_validate(t) for t in tasks],
    )


@router.get(
    "/my-selection",
    response_model=SelectedTasksListResponse,
    status_code=status.HTTP_200_OK,
    summary="Get user's selected tasks",
    description="Returns the tasks currently selected and confirmed by the authenticated user.",
)
async def get_my_selected_tasks(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> SelectedTasksListResponse:
    tasks = await task_service.get_user_selected_tasks(session, current_user.id)
    return SelectedTasksListResponse(
        total_count=len(tasks),
        tasks=[TaskResponse.model_validate(t) for t in tasks],
    )
