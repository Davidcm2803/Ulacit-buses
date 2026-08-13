from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer,
)
from firebase_admin import auth

from app.services.firebase_service import verify_firebase_token
from app.services.user_service import get_user_by_firebase_uid


bearer_scheme = HTTPBearer(
    auto_error=False,
    scheme_name="Firebase Authentication",
)


def get_current_firebase_user(
    credentials: Annotated[
        HTTPAuthorizationCredentials | None,
        Depends(bearer_scheme),
    ],
) -> dict:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Debe iniciar sesión",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )

    if credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Esquema de autenticación inválido",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )

    try:
        return verify_firebase_token(
            credentials.credentials
        )

    except auth.RevokedIdTokenError as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="La sesión fue revocada",
        ) from error

    except auth.ExpiredIdTokenError as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="La sesión expiró",
        ) from error

    except auth.InvalidIdTokenError as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido",
        ) from error

    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No fue posible validar la sesión",
        ) from error


def get_current_app_user(
    firebase_user: Annotated[
        dict,
        Depends(get_current_firebase_user),
    ],
) -> dict:
    user = get_user_by_firebase_uid(
        firebase_user["uid"]
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El perfil del usuario no existe",
        )

    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="El usuario está deshabilitado",
        )

    return user


def require_admin(
    current_user: Annotated[
        dict,
        Depends(get_current_app_user),
    ],
) -> dict:
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Se requieren permisos administrativos",
        )

    return current_user