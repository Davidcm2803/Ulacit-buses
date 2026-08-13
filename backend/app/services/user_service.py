from datetime import datetime, timezone

from app.Mongo.connection import db


users_collection = db["usuarios"]


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def get_provider(firebase_user: dict) -> str:
    firebase_data = firebase_user.get("firebase", {})

    firebase_provider = firebase_data.get(
        "sign_in_provider",
        "unknown",
    )

    providers = {
        "password": "email",
        "google.com": "google",
        "microsoft.com": "microsoft",
    }

    return providers.get(
        firebase_provider,
        firebase_provider,
    )


def synchronize_user(
    firebase_user: dict,
    username: str | None = None,
) -> dict:
    firebase_uid = firebase_user["uid"]
    email = firebase_user.get("email")
    photo_url = firebase_user.get("picture")
    display_name = firebase_user.get("name")
    provider = get_provider(firebase_user)

    resolved_username = (
        username
        or display_name
        or (email.split("@")[0] if email else None)
        or f"user-{firebase_uid[:8]}"
    )

    now = utc_now()

    set_fields = {
        "email": email,
        "photo_url": photo_url,
        "provider": provider,
        "updated_at": now,
    }

    set_on_insert_fields = {
        "firebase_uid": firebase_uid,
        "role": "user",
        "is_active": True,
        "created_at": now,
    }

    if provider in ("google", "microsoft"):
        set_fields["username"] = resolved_username
    else:
        set_on_insert_fields["username"] = resolved_username

    users_collection.update_one(
        {"firebase_uid": firebase_uid},
        {
            "$set": set_fields,
            "$setOnInsert": set_on_insert_fields,
        },
        upsert=True,
    )

    return users_collection.find_one(
        {"firebase_uid": firebase_uid},
        {"_id": 0},
    )


def get_user_by_firebase_uid(firebase_uid: str) -> dict | None:
    return users_collection.find_one(
        {"firebase_uid": firebase_uid},
        {"_id": 0},
    )