from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class Coordenada(BaseModel):
    lat: float
    lng: float


class TicketOut(BaseModel):
    id: str
    ruta_id: str
    ruta_nombre: str
    parada_nombre: str
    horario: str
    cantidad: int
    monto: float
    estado: str
    createdAt: datetime
    validado_en: Optional[datetime] = None
    tiempo_min: Optional[int] = None


class ParadaTicket(BaseModel):
    id: str
    nombre: str
    lat: float
    lng: float
    tipo: str
    canton: str
    provincia: str


class TicketConRuta(TicketOut):
    trazado: List[Coordenada] = []
    tiempo_min: Optional[int] = None
    distancia_km: Optional[float] = None
    paradas: List[ParadaTicket] = []   # nuevo