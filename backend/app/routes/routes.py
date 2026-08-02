from fastapi import APIRouter, Depends, HTTPException, Query

from app.middlewares.auth_middleware import require_admin
from app.models.route import RouteCreate, RouteUpdate, RouteOut, StopOut, StopSync
from app.services import route_service, stop_service

router = APIRouter(prefix="/routes", tags=["routes"])


@router.get("", response_model=list[RouteOut])
def list_routes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    origen: str | None = Query(None),
    destino: str | None = Query(None),
):
    from app.Mongo.connection import db
    return route_service.get_all_routes(db, skip, limit, origen, destino)


@router.get("/{route_id}", response_model=RouteOut)
def get_route(route_id: str):
    from app.Mongo.connection import db
    route = route_service.get_route_by_id(db, route_id)
    if not route:
        raise HTTPException(404, "Ruta no encontrada")
    return route


@router.post("", response_model=RouteOut, status_code=201)
def create_route(
    body: RouteCreate,
    _admin: dict = Depends(require_admin),
):
    from app.Mongo.connection import db
    return route_service.create_route(db, body)


@router.put("/{route_id}", response_model=RouteOut)
def update_route(
    route_id: str,
    body: RouteUpdate,
    _admin: dict = Depends(require_admin),
):
    from app.Mongo.connection import db
    route = route_service.update_route(db, route_id, body)
    if not route:
        raise HTTPException(404, "Ruta no encontrada")
    return route


@router.delete("/{route_id}", status_code=204)
def delete_route(
    route_id: str,
    _admin: dict = Depends(require_admin),
):
    from app.Mongo.connection import db
    stop_service.delete_stops_by_route(db, route_id)
    if not route_service.delete_route(db, route_id):
        raise HTTPException(404, "Ruta no encontrada")


@router.get("/{route_id}/stops", response_model=list[StopOut])
def get_route_stops(route_id: str):
    from app.Mongo.connection import db
    if not route_service.get_route_by_id(db, route_id):
        raise HTTPException(404, "Ruta no encontrada")
    return route_service.get_stops_by_route(db, route_id)


@router.put("/{route_id}/stops", response_model=list[StopOut])
def sync_route_stops(
    route_id: str,
    body: list[StopSync],
    _admin: dict = Depends(require_admin),
):
    """Reemplaza TODAS las paradas de la ruta por la lista enviada (usado al editar)."""
    from app.Mongo.connection import db
    if not route_service.get_route_by_id(db, route_id):
        raise HTTPException(404, "Ruta no encontrada")
    return route_service.replace_stops_for_route(db, route_id, body)