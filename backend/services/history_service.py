from datetime import datetime
from bson import ObjectId
from DB.connection import db


def _serializar(doc):
    doc["_id"] = str(doc["_id"])
    doc["usuario"] = str(doc["usuario"])
    doc["ruta"] = str(doc["ruta"])
    return doc


def crear_entrada(usuario_id: str, ruta_id: str, origen_buscado: str, destino_buscado: str):
    entrada = {
        "usuario": ObjectId(usuario_id),
        "ruta": ObjectId(ruta_id),
        "origen_buscado": origen_buscado,
        "destino_buscado": destino_buscado,
        "consultado_en": datetime.utcnow(),
    }
    resultado = db.historial.insert_one(entrada)
    return str(resultado.inserted_id)


def obtener_historial_usuario(usuario_id: str, limite: int = 20):
    cursor = db.historial.find(
        {"usuario": ObjectId(usuario_id)}
    ).sort("consultado_en", -1).limit(limite)
    return [_serializar(doc) for doc in cursor]