from datetime import datetime, timedelta, timezone
from bson import ObjectId
from bson.errors import InvalidId
from pymongo.database import Database

from app.services.payment_service import calcular_salida_at, CR_TZ


def _asegurar_utc(dt: datetime | None) -> datetime | None:
    if dt and dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


def _proxima_ocurrencia_legacy(horario: str, desde: datetime) -> datetime:
    desde_cr = desde.astimezone(CR_TZ)
    h, m = map(int, horario.split(":"))
    salida_cr = desde_cr.replace(hour=h, minute=m, second=0, microsecond=0)
    if salida_cr < desde_cr:
        salida_cr += timedelta(days=1)
    return salida_cr.astimezone(timezone.utc)


def _calcular_estado_viaje(salida_at: datetime | None, tiempo_min: int | None,
                            ahora: datetime | None = None) -> str:
    if not salida_at:
        return "sin_datos"

    ahora = ahora or datetime.now(timezone.utc)
    salida_at = _asegurar_utc(salida_at)

    if ahora < salida_at:
        return "por_salir"

    if not tiempo_min:
        return "finalizado"

    llegada = salida_at + timedelta(minutes=tiempo_min)
    if ahora >= llegada:
        return "finalizado"

    return "en_curso"


def _serializar(t: dict) -> dict:
    t["id"] = str(t["_id"])
    del t["_id"]

    if t.get("createdAt"):
        t["createdAt"] = _asegurar_utc(t["createdAt"])

    salida_at = t.get("salida_at")
    if not salida_at:
        if t.get("fecha") and t.get("horario"):
            salida_at = calcular_salida_at(t["fecha"], t["horario"])
        elif t.get("horario") and t.get("createdAt"):
            salida_at = _proxima_ocurrencia_legacy(t["horario"], t["createdAt"])

    t["salida_at"] = _asegurar_utc(salida_at)
    return t


def get_tickets_by_usuario(db: Database, usuario_id: str) -> list[dict]:
    tickets = list(db.tickets.find({"usuario_id": usuario_id}).sort("createdAt", -1))
    tickets = [_serializar(t) for t in tickets]

    ruta_ids = {t["ruta_id"] for t in tickets if t.get("ruta_id")}
    rutas_por_id = {}
    for rid in ruta_ids:
        try:
            ruta = db.rutas.find_one({"_id": ObjectId(rid)})
            if ruta:
                rutas_por_id[rid] = ruta.get("tiempo_min")
        except (InvalidId, TypeError):
            continue

    ahora = datetime.now(timezone.utc)
    for t in tickets:
        t["tiempo_min"] = rutas_por_id.get(t.get("ruta_id"))
        t["estado_viaje"] = _calcular_estado_viaje(t["salida_at"], t["tiempo_min"], ahora)

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
    ticket["estado_viaje"] = _calcular_estado_viaje(
        ticket["salida_at"], ticket["tiempo_min"], datetime.now(timezone.utc)
    )

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