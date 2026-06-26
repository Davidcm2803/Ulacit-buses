from app.Mongo.connection import db

def crear_indices():
    db.historial.create_index("usuario")
    db.historial.create_index([("consultado_en", -1)])

    db.users.create_index(
        "firebase_uid",
        unique=True,
    )

    db.users.create_index(
        "email",
        unique=True,
        sparse=True,
    )