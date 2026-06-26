from pathlib import Path

import firebase_admin
from firebase_admin import auth, credentials


BASE_DIR = Path(__file__).resolve().parents[2]
SERVICE_ACCOUNT_PATH = BASE_DIR / "firebase-service-account.json"


def initialize_firebase() -> None:

    if firebase_admin._apps:
        return

    if not SERVICE_ACCOUNT_PATH.exists():
        raise RuntimeError(
            "No se encontró firebase-service-account.json "
            f"en {SERVICE_ACCOUNT_PATH}"
        )

    firebase_credentials = credentials.Certificate(
        str(SERVICE_ACCOUNT_PATH)
    )

    firebase_admin.initialize_app(firebase_credentials)


def verify_firebase_token(id_token: str) -> dict:

    initialize_firebase()

    return auth.verify_id_token(
        id_token,
        check_revoked=True,
    )