from bson import ObjectId
from bson.errors import InvalidId
from pymongo.database import Database

from app.models.route import StopCreate, StopUpdate


def _valid_oid(id: str) -> ObjectId | None:
    try:
        return ObjectId(id)
    except InvalidId:
        return None


def _stop_out(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id"))
    doc.pop("location", None)
    return doc


def _con_location(payload: dict) -> dict:
    if payload.get("lat") is not None and payload.get("lng") is not None:
        payload["location"] = {"type": "Point", "coordinates": [payload["lng"], payload["lat"]]}
    return payload


def get_all_stops(db: Database, skip: int = 0, limit: int = 200):
    cursor = db.paradas.find({}).skip(skip).limit(limit)
    return [_stop_out(doc) for doc in cursor]


def get_stop_by_id(db: Database, stop_id: str):
    oid = _valid_oid(stop_id)
    if not oid:
        return None
    doc = db.paradas.find_one({"_id": oid})
    return _stop_out(doc) if doc else None


def create_stop(db: Database, data: StopCreate):
    payload = _con_location(data.model_dump())
    result = db.paradas.insert_one(payload)
    doc = db.paradas.find_one({"_id": result.inserted_id})
    return _stop_out(doc)


def update_stop(db: Database, stop_id: str, data: StopUpdate):
    oid = _valid_oid(stop_id)
    if not oid:
        return None
    update = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update:
        return get_stop_by_id(db, stop_id)

    if "lat" in update or "lng" in update:
        current = db.paradas.find_one({"_id": oid}, {"lat": 1, "lng": 1})
        lat = update.get("lat", current.get("lat") if current else None)
        lng = update.get("lng", current.get("lng") if current else None)
        if lat is not None and lng is not None:
            update["location"] = {"type": "Point", "coordinates": [lng, lat]}

    db.paradas.update_one({"_id": oid}, {"$set": update})
    doc = db.paradas.find_one({"_id": oid})
    return _stop_out(doc) if doc else None


def delete_stop(db: Database, stop_id: str) -> bool:
    oid = _valid_oid(stop_id)
    if not oid:
        return False
    result = db.paradas.delete_one({"_id": oid})
    return result.deleted_count == 1


def delete_stops_by_route(db: Database, route_id: str) -> int:
    result = db.paradas.delete_many({"route_id": route_id})
    return result.deleted_count


def get_nearby_stops(
    db: Database,
    lat: float,
    lng: float,
    limit: int = 10,
    max_distance_m: float = 10000,
):
    pipeline = [
        {
            "$geoNear": {
                "near": {"type": "Point", "coordinates": [lng, lat]},
                "distanceField": "distancia_m",
                "maxDistance": max_distance_m,
                "spherical": True,
            }
        },
        {"$limit": limit},
    ]
    resultado = []
    for doc in db.paradas.aggregate(pipeline):
        distancia = doc.pop("distancia_m", None)
        out = _stop_out(doc)
        out["distancia_m"] = round(distancia) if distancia is not None else None
        resultado.append(out)
    return resultado