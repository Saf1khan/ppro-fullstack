import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    category_id: uuid.UUID
    name: str
    short_description: str
    display_order: int
    category_name: Optional[str] = None


class CategoryWithTasksResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    slug: str
    icon_name: str
    display_order: int
    tasks: List[TaskResponse]


class SelectTasksRequest(BaseModel):
    task_ids: List[uuid.UUID] = Field(
        min_length=1,
        description="List of selected task IDs (minimum 1 task)",
    )


class SelectedTasksListResponse(BaseModel):
    total_count: int
    tasks: List[TaskResponse]
