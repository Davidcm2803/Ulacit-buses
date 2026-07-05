from datetime import datetime, timezone

import stripe
from pymongo.database import Database

from app.config import settings

stripe.api_key = settings.STRIPE_SECRET_KEY


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
    """
    Convierte intent.metadata a un dict plano de Python.

    Desde stripe-python v15, StripeObject ya NO hereda de dict, asi que
    dict(intent.metadata) rompe con KeyError: 0. Usamos to_dict(), el
    metodo que el SDK expone justamente para esta conversion.
    """
    if not intent.metadata:
        return {}
    try:
        return intent.metadata.to_dict()
    except AttributeError:
        return {}


def guardar_ticket(db: Database, intent, usuario_id: str | None = None):
    """
    Guarda el registro de compra en la coleccion 'tickets' usando
    la metadata que ya viene adjunta al PaymentIntent.
    """
    metadata = get_metadata_dict(intent)

    ticket = {
        "usuario_id": usuario_id,
        "ruta_id": metadata.get("ruta_id"),
        "ruta_nombre": metadata.get("ruta_nombre"),
        "parada_nombre": metadata.get("parada_nombre"),
        "horario": metadata.get("horario"),
        "cantidad": int(metadata.get("cantidad", 1)),
        "monto": intent.amount / 100,  # de centimos a colones
        "stripe_payment_id": intent.id,
        "estado": "activo",
        "validado_en": None,
        "createdAt": datetime.now(timezone.utc),
    }

    result = db.tickets.insert_one(ticket)
    ticket["_id"] = str(result.inserted_id)
    return ticket