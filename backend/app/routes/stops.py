from fastapi import APIRouter, Depends, HTTPException, Query

from app.middlewares.auth_middleware import require_admin
from app.models.route import StopCreate, StopUpdate, StopOut
from app.services import stop_service

router = APIRouter(prefix="/stops", tags=["stops"])


@router.get("", response_model=list[StopOut])
def list_stops(skip: int = Query(0, ge=0), limit: int = Query(200, ge=1, le=1000)):
    from app.Mongo.connection import db
    return stop_service.get_all_stops(db, skip, limit)


@router.get("/{stop_id}", response_model=StopOut)
def get_stop(stop_id: str):
    from app.Mongo.connection import db
    stop = stop_service.get_stop_by_id(db, stop_id)
    if not stop:
        raise HTTPException(404, "Parada no encontrada")
    return stop


@router.post("", response_model=StopOut, status_code=201)
def create_stop(
    body: StopCreate,
    _admin: dict = Depends(require_admin),
):
    from app.Mongo.connection import db
    return stop_service.create_stop(db, body)


@router.put("/{stop_id}", response_model=StopOut)
def update_stop(
    stop_id: str,
    body: StopUpdate,
    _admin: dict = Depends(require_admin),
):
    from app.Mongo.connection import db
    stop = stop_service.update_stop(db, stop_id, body)
    if not stop:
        raise HTTPException(404, "Parada no encontrada")
    return stop


@router.delete("/{stop_id}", status_code=204)
def delete_stop(
    stop_id: str,
    _admin: dict = Depends(require_admin),
):
    from app.Mongo.connection import db
    if not stop_service.delete_stop(db, stop_id):
        raise HTTPException(404, "Parada no encontrada")