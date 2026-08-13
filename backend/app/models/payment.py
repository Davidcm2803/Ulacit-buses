from pydantic import BaseModel
from typing import Optional


class PaymentIntentCreate(BaseModel):
    monto: float
    ruta_id: str
    ruta_nombre: str
    parada_nombre: str
    horario: str
    fecha: str
    cantidad: int


class PaymentIntentOut(BaseModel):
    client_secret: str
    payment_intent_id: str


class PaymentConfirm(BaseModel):
    payment_intent_id: str


class PaymentStatusOut(BaseModel):
    status: str
    monto: Optional[float] = None
    ruta_nombre: Optional[str] = None