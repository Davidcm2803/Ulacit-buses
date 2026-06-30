from pydantic import BaseModel, Field
from typing import List, Optional


# Coordenada

class Coordenada(BaseModel):
    lat: float
    lng: float


# Parada

class StopCreate(BaseModel):
    nombre:   str
    lat:      float
    lng:      float
    tipo:     str            # "origen" | "parada" | "destino"
    orden:    int
    route_id: str


class StopUpdate(BaseModel):
    nombre: Optional[str]  = None
    lat:    Optional[float] = None
    lng:    Optional[float] = None
    tipo:   Optional[str]  = None
    orden:  Optional[int]  = None


class StopOut(BaseModel):
    id:       str
    nombre:   str
    lat:      float
    lng:      float
    tipo:     str
    orden:    int
    route_id: str


# Ruta

class RouteCreate(BaseModel):
    nombre:       str
    codigo:       str
    descripcion:  Optional[str]  = ""
    primer_bus:   str            # "04:30" quemados en el front
    ultimo_bus:   str            # "22:00"
    frecuencia:   int            # minutos
    tarifa:       float
    distancia_km: Optional[float] = None
    tiempo_min:   Optional[int]   = None
    trazado:      List[Coordenada] = Field(default_factory=list)
    activa:       bool            = True


class RouteUpdate(BaseModel):
    nombre:       Optional[str]   = None
    codigo:       Optional[str]   = None
    descripcion:  Optional[str]   = None
    primer_bus:   Optional[str]   = None
    ultimo_bus:   Optional[str]   = None
    frecuencia:   Optional[int]   = None
    tarifa:       Optional[float] = None
    distancia_km: Optional[float] = None
    tiempo_min:   Optional[int]   = None
    trazado:      Optional[List[Coordenada]] = None
    activa:       Optional[bool]  = None


class RouteOut(BaseModel):
    id:           str
    nombre:       str
    codigo:       str
    descripcion:  str
    primer_bus:   str
    ultimo_bus:   str
    frecuencia:   int
    tarifa:       float
    distancia_km: Optional[float]
    tiempo_min:   Optional[int]
    trazado:      List[Coordenada]
    activa:       bool