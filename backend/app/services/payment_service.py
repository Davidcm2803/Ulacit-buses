from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

import stripe
from pymongo.database import Database

from app.config import settings

stripe.api_key = settings.STRIPE_SECRET_KEY

CR_TZ = ZoneInfo("America/Costa_Rica")


def crear_payment_intent(monto: float, ruta_id: str, ruta_nombre: str,
                          parada_nombre: str, horario: str, fecha: str, cantidad: int):
    monto_stripe = int(round(monto * 100))

    intent = stripe.PaymentIntent.create(
        amount=monto_stripe,
        currency="crc",
        automatic_payment_methods={"enabled": True},
        metadata={
            "ruta_id": ruta_id,
            "ruta_nombre": ruta_nombre,
            "parada_nombre": parada_nombre,
            "horario": horario,
            "fecha": fecha,
            "cantidad": str(cantidad),
        },
    )
    return intent


def obtener_payment_intent(payment_intent_id: str):
    return stripe.PaymentIntent.retrieve(payment_intent_id)


def get_metadata_dict(intent) -> dict:
    if not intent.metadata:
        return {}
    try:
        return intent.metadata.to_dict()
    except AttributeError:
        return {}


def calcular_salida_at(fecha: str, horario: str) -> datetime:
    h, m = map(int, horario.split(":"))
    y, mo, d = map(int, fecha.split("-"))
    salida_cr = datetime(y, mo, d, h, m, tzinfo=CR_TZ)
    return salida_cr.astimezone(timezone.utc)


def guardar_ticket(db: Database, intent, usuario_id: str | None = None):
    metadata = get_metadata_dict(intent)
    horario = metadata.get("horario")
    fecha = metadata.get("fecha")
    ahora = datetime.now(timezone.utc)

    ticket = {
        "usuario_id": usuario_id,
        "ruta_id": metadata.get("ruta_id"),
        "ruta_nombre": metadata.get("ruta_nombre"),
        "parada_nombre": metadata.get("parada_nombre"),
        "horario": horario,
        "fecha": fecha,
        "salida_at": calcular_salida_at(fecha, horario) if fecha and horario else None,
        "cantidad": int(metadata.get("cantidad", 1)),
        "monto": intent.amount / 100,
        "stripe_payment_id": intent.id,
        "estado": "activo",
        "validado_en": None,
        "createdAt": ahora,
    }

    result = db.tickets.insert_one(ticket)
    ticket["_id"] = str(result.inserted_id)
    return ticket