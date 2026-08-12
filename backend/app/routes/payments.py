from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from app.middlewares.auth_middleware import get_current_app_user
from app.models.payment import PaymentIntentCreate, PaymentIntentOut, PaymentConfirm, PaymentStatusOut
from app.services import payment_service

router = APIRouter(prefix="/payments", tags=["payments"])


@router.post("/create-intent", response_model=PaymentIntentOut)
def create_intent(
    body: PaymentIntentCreate,
    current_user: Annotated[dict, Depends(get_current_app_user)],
):
    try:
        intent = payment_service.crear_payment_intent(
            monto=body.monto,
            ruta_id=body.ruta_id,
            ruta_nombre=body.ruta_nombre,
            parada_nombre=body.parada_nombre,
            horario=body.horario,
            fecha=body.fecha,
            cantidad=body.cantidad,
        )
    except Exception as e:
        raise HTTPException(400, f"Error creando el pago: {str(e)}")

    return PaymentIntentOut(
        client_secret=intent.client_secret,
        payment_intent_id=intent.id,
    )


@router.post("/confirm", response_model=PaymentStatusOut)
def confirm_payment(
    body: PaymentConfirm,
    current_user: Annotated[dict, Depends(get_current_app_user)],
):
    from app.Mongo.connection import db

    try:
        intent = payment_service.obtener_payment_intent(body.payment_intent_id)
    except Exception as e:
        raise HTTPException(400, f"Error verificando el pago: {str(e)}")

    if intent.status != "succeeded":
        raise HTTPException(400, f"El pago no se ha completado (status: {intent.status})")

    usuario_id = current_user.get("firebase_uid")
    
    # Guardar el historial de compra. Si esto falla, el pago ya se hizo
    # en Stripe de todas formas, asi que no tumbamos la respuesta al usuario;
    # solo lo registramos para revisarlo despues.
    try:
        payment_service.guardar_ticket(db, intent, usuario_id=usuario_id)
    except Exception as e:
        print(f"[WARN] No se pudo guardar el ticket en Mongo: {e}")

    metadata = payment_service.get_metadata_dict(intent)

    return PaymentStatusOut(
        status=intent.status,
        monto=intent.amount / 100,
        ruta_nombre=metadata.get("ruta_nombre"),
    )