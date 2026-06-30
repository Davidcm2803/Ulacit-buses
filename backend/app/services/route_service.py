from bson import ObjectId
from bson.errors import InvalidId
from pymongo.database import Database

from app.models.route import RouteCreate, RouteUpdate


def _valid_oid(id: str) -> ObjectId | None:
    try:
        return ObjectId(id)
    except InvalidId:
        return None


def _route_out(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id"))

    # Normalizar campos del seed viejo al esquema nuevo
    if "ruta_nombre" in doc and "nombre" not in doc:
        doc["nombre"] = doc.pop("ruta_nombre")
    if "horario" in doc:
        horario = doc.pop("horario")
        doc.setdefault("primer_bus",  horario.get("primer_bus", ""))
        doc.setdefault("ultimo_bus",  horario.get("ultimo_bus", ""))
        doc.setdefault("frecuencia",  horario.get("frecuencia_bus", 0))
    if "coordenadas_recorrido" in doc and "trazado" not in doc:
        doc["trazado"] = doc.pop("coordenadas_recorrido")

    # Campos que pueden no existir en el seed
    doc.setdefault("codigo",       "")
    doc.setdefault("descripcion",  "")
    doc.setdefault("distancia_km", None)
    doc.setdefault("tiempo_min",   None)
    doc.setdefault("trazado",      [])
    doc.setdefault("activa",       True)

    return doc


def _stop_out(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id"))
    return doc



def get_all_routes(db: Database, skip: int = 0, limit: int = 100):
    cursor = db.rutas.find({}).skip(skip).limit(limit)
    return [_route_out(doc) for doc in cursor]


def get_route_by_id(db: Database, route_id: str):
    oid = _valid_oid(route_id)
    if not oid:
        return None
    doc = db.rutas.find_one({"_id": oid})
    return _route_out(doc) if doc else None


def create_route(db: Database, data: RouteCreate):
    payload = data.model_dump()
    payload["trazado"] = [c.model_dump() for c in data.trazado]
    result = db.rutas.insert_one(payload)
    doc = db.rutas.find_one({"_id": result.inserted_id})
    return _route_out(doc)


def update_route(db: Database, route_id: str, data: RouteUpdate):
    oid = _valid_oid(route_id)
    if not oid:
        return None
    update = {k: v for k, v in data.model_dump().items() if v is not None}
    if "trazado" in update:
        update["trazado"] = [c.model_dump() for c in data.trazado]
    if not update:
        return get_route_by_id(db, route_id)
    db.rutas.update_one({"_id": oid}, {"$set": update})
    doc = db.rutas.find_one({"_id": oid})
    return _route_out(doc) if doc else None


def delete_route(db: Database, route_id: str) -> bool:
    oid = _valid_oid(route_id)
    if not oid:
        return False
    result = db.rutas.delete_one({"_id": oid})
    return result.deleted_count == 1


def get_stops_by_route(db: Database, route_id: str):
    cursor = db.paradas.find({"route_id": route_id}).sort("orden", 1)
    return [_stop_out(doc) for doc in cursor]