from app.Mongo.connection import db


def migrar():
    paradas = db.paradas.find({
        "location": {"$exists": False},
        "lat": {"$exists": True},
        "lng": {"$exists": True},
    })
    actualizadas = 0
    for p in paradas:
        db.paradas.update_one(
            {"_id": p["_id"]},
            {"$set": {"location": {"type": "Point", "coordinates": [p["lng"], p["lat"]]}}},
        )
        actualizadas += 1
    print(f"{actualizadas} paradas actualizadas con campo 'location'.")


if __name__ == "__main__":
    migrar()