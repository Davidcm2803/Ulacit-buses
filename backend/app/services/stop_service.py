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
    return doc



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
    payload = data.model_dump()
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