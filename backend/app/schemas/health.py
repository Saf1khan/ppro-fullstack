from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = Field(default="ok", description="Service status indicator")
    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Current server UTC timestamp",
    )
    environment: str = Field(default="development", description="Current environment")
    version: str = Field(default="0.1.0", description="API version")
    database: Optional[str] = Field(
        default=None,
        description="Database connectivity status (if evaluated)",
    )
