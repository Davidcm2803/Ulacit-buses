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

    if "ruta_nombre" in doc and "nombre" not in doc:
        doc["nombre"] = doc.pop("ruta_nombre")
    if "horario" in doc:
        horario = doc.pop("horario")
        doc.setdefault("primer_bus", horario.get("primer_bus", ""))
        doc.setdefault("ultimo_bus", horario.get("ultimo_bus", ""))
        doc.setdefault("frecuencia", horario.get("frecuencia_bus", 0))
    if "coordenadas_recorrido" in doc and "trazado" not in doc:
        doc["trazado"] = doc.pop("coordenadas_recorrido")

    doc.setdefault("codigo", "")
    doc.setdefault("descripcion", "")
    doc.setdefault("distancia_km", None)
    doc.setdefault("tiempo_min", None)
    doc.setdefault("trazado", [])
    doc.setdefault("activa", True)
    doc.setdefault("canton_origen", "")
    doc.setdefault("provincia_origen", "")
    doc.setdefault("canton_destino", "")
    doc.setdefault("provincia_destino", "")

    return doc


def _stop_out(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id"))
    doc.pop("location", None)
    return doc


def get_all_routes(
    db: Database,
    skip: int = 0,
    limit: int = 100,
    provincia_origen: str | None = None,
    canton_origen: str | None = None,
    provincia_destino: str | None = None,
    canton_destino: str | None = None,
):
    query = {}
    if provincia_origen:
        query["provincia_origen"] = provincia_origen
    if canton_origen:
        query["canton_origen"] = canton_origen
    if provincia_destino:
        query["provincia_destino"] = provincia_destino
    if canton_destino:
        query["canton_destino"] = canton_destino

    cursor = db.rutas.find(query).skip(skip).limit(limit)
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


def replace_stops_for_route(db: Database, route_id: str, stops: list):
    db.paradas.delete_many({"route_id": route_id})

    if not stops:
        return []

    payload = [{**s.model_dump(), "route_id": route_id} for s in stops]
    result = db.paradas.insert_many(payload)
    docs = db.paradas.find({"_id": {"$in": result.inserted_ids}}).sort("orden", 1)
    return [_stop_out(doc) for doc in docs]


def get_nearby_routes(
    db: Database,
    lat: float,
    lng: float,
    limit: int = 5,
    max_distance_m: float = 10000,
):
    pipeline = [
        {
            "$geoNear": {
                "near": {"type": "Point", "coordinates": [lng, lat]},
                "distanceField": "distancia_m",
                "maxDistance": max_distance_m,
                "spherical": True,
                "query": {"route_id": {"$exists": True}},
            }
        },
        {
            "$group": {
                "_id": "$route_id",
                "distancia_m": {"$min": "$distancia_m"},
                "parada_cercana": {"$first": "$nombre"},
            }
        },
        {"$sort": {"distancia_m": 1}},
        {"$limit": limit},
    ]

    cercanas = list(db.paradas.aggregate(pipeline))
    resultado = []
    for c in cercanas:
        oid = _valid_oid(c["_id"])
        if not oid:
            continue
        doc = db.rutas.find_one({"_id": oid, "activa": True})
        if not doc:
            continue
        ruta = _route_out(doc)
        ruta["distancia_m"] = round(c["distancia_m"])
        ruta["parada_cercana"] = c["parada_cercana"]
        resultado.append(ruta)
    return resultado