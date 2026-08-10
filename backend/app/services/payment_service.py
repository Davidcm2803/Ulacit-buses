from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

import stripe
from pymongo.database import Database

from app.config import settings

stripe.api_key = settings.STRIPE_SECRET_KEY

CR_TZ = ZoneInfo("America/Costa_Rica")


def crear_payment_intent(monto: float, ruta_id: str, ruta_nombre: str,
                          parada_nombre: str, horario: str, cantidad: int):
    # CRC NO es moneda zero-decimal en Stripe, hay que mandar en centimos (x100)
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


def calcular_salida_at(horario: str, ahora_utc: datetime | None = None) -> datetime:

    #Calcula la proxima salida como datetime completo en UTC
    
    ahora_utc = ahora_utc or datetime.now(timezone.utc)
    ahora_cr = ahora_utc.astimezone(CR_TZ)

    h, m = map(int, horario.split(":"))
    salida_cr = ahora_cr.replace(hour=h, minute=m, second=0, microsecond=0)

    if salida_cr < ahora_cr:
        salida_cr += timedelta(days=1)

    return salida_cr.astimezone(timezone.utc)


def guardar_ticket(db: Database, intent, usuario_id: str | None = None):
    
    metadata = get_metadata_dict(intent)
    horario = metadata.get("horario")
    ahora = datetime.now(timezone.utc)

    ticket = {
        "usuario_id": usuario_id,
        "ruta_id": metadata.get("ruta_id"),
        "ruta_nombre": metadata.get("ruta_nombre"),
        "parada_nombre": metadata.get("parada_nombre"),
        "horario": horario,
        "salida_at": calcular_salida_at(horario, ahora) if horario else None,
        "cantidad": int(metadata.get("cantidad", 1)),
        "monto": intent.amount / 100,  # de centimos a colones
        "stripe_payment_id": intent.id,
        "estado": "activo",
        "validado_en": None,
        "createdAt": ahora,
    }

    result = db.tickets.insert_one(ticket)
    ticket["_id"] = str(result.inserted_id)
    return ticket