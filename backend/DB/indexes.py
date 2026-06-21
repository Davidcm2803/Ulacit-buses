from DB.connection import db

def crear_indices():
    db.historial.create_index("usuario")
    db.historial.create_index([("consultado_en", -1)])