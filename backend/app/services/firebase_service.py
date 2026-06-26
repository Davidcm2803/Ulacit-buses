import json
import os

import firebase_admin
from firebase_admin import auth, credentials


def initialize_firebase() -> None:

    if firebase_admin._apps:
        return

    firebase_credentials_json = os.getenv("FIREBASE_CREDENTIALS")

    if not firebase_credentials_json:
        raise RuntimeError(
            "No se encontró la variable de entorno FIREBASE_CREDENTIALS"
        )

    try:
        credentials_dict = json.loads(firebase_credentials_json)
    except json.JSONDecodeError as e:
        raise RuntimeError(
            f"FIREBASE_CREDENTIALS no es un JSON válido: {e}"
        )

    firebase_credentials = credentials.Certificate(credentials_dict)

    firebase_admin.initialize_app(firebase_credentials)


def verify_firebase_token(id_token: str) -> dict:

    initialize_firebase()

    return auth.verify_id_token(
        id_token,
        check_revoked=True,
    )