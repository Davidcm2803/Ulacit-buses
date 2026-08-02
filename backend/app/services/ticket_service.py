from datetime import timezone
from bson import ObjectId
from bson.errors import InvalidId
from pymongo.database import Database


def _serializar(t: dict) -> dict:
    t["id"] = str(t["_id"])
    del t["_id"]
    if t.get("createdAt") and t["createdAt"].tzinfo is None:
        t["createdAt"] = t["createdAt"].replace(tzinfo=timezone.utc)
    return t


def get_tickets_by_usuario(db: Database, usuario_id: str) -> list[dict]:
    tickets = list(db.tickets.find({"usuario_id": usuario_id}).sort("createdAt", -1))
    tickets = [_serializar(t) for t in tickets]

    # Traer tiempo_min de cada ruta asociada (para saber si el viaje ya terminó)
    ruta_ids = {t["ruta_id"] for t in tickets if t.get("ruta_id")}
    rutas_por_id = {}
    for rid in ruta_ids:
        try:
            ruta = db.rutas.find_one({"_id": ObjectId(rid)})
            if ruta:
                rutas_por_id[rid] = ruta.get("tiempo_min")
        except (InvalidId, TypeError):
            continue

    for t in tickets:
        t["tiempo_min"] = rutas_por_id.get(t.get("ruta_id"))

    return tickets


def get_ticket_by_id(db: Database, ticket_id: str, usuario_id: str) -> dict | None:
    try:
        oid = ObjectId(ticket_id)
    except InvalidId:
        return None

    ticket = db.tickets.find_one({"_id": oid, "usuario_id": usuario_id})
    if not ticket:
        return None

    ticket = _serializar(ticket)

    ruta = None
    try:
        ruta = db.rutas.find_one({"_id": ObjectId(ticket["ruta_id"])})
    except (InvalidId, TypeError):
        pass

    ticket["trazado"] = ruta.get("trazado", []) if ruta else []
    ticket["tiempo_min"] = ruta.get("tiempo_min") if ruta else None
    ticket["distancia_km"] = ruta.get("distancia_km") if ruta else None

    paradas_cursor = db.paradas.find({"route_id": ticket["ruta_id"]}).sort("orden", 1)
    ticket["paradas"] = [
        {
            "id": str(p["_id"]),
            "nombre": p["nombre"],
            "lat": p["lat"],
            "lng": p["lng"],
            "tipo": p["tipo"],
            "canton": p["canton"],
            "provincia": p["provincia"],
        }
        for p in paradas_cursor
    ]

    return ticket