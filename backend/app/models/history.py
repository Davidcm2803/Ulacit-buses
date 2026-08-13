from pydantic import BaseModel
from datetime import datetime

class HistoryCreate(BaseModel):
    ruta: str
    origen_buscado: str
    destino_buscado: str

class HistoryResponse(BaseModel):
    id: str
    usuario: str
    ruta: str
    origen_buscado: str
    destino_buscado: str
    consultado_en: datetime