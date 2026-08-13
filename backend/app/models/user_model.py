from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field


UserRole = Literal["user", "admin"]


class UserSyncRequest(BaseModel):
    username: str | None = Field(
        default=None,
        min_length=3,
        max_length=50,
    )


class UserResponse(BaseModel):
    firebase_uid: str
    username: str
    email: EmailStr | None = None
    photo_url: str | None = None
    provider: str
    role: UserRole
    is_active: bool
    created_at: datetime
    updated_at: datetime