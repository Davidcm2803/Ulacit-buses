from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.middlewares.auth_middleware import (
    get_current_app_user,
    get_current_firebase_user,
)
from app.models.user_model import (
    UserResponse,
    UserSyncRequest,
)
from app.services.user_service import synchronize_user


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post(
    "/sync",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
)
def sync_user(
    data: UserSyncRequest,
    firebase_user: Annotated[
        dict,
        Depends(get_current_firebase_user),
    ],
):

    user = synchronize_user(
        firebase_user=firebase_user,
        username=data.username,
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No fue posible sincronizar el usuario",
        )

    return user


@router.get(
    "/me",
    response_model=UserResponse,
)
def get_my_profile(
    current_user: Annotated[
        dict,
        Depends(get_current_app_user),
    ],
):
    return current_user