import os
import time
import math
import random
import argparse
from pathlib import Path
from datetime import datetime

import requests
from bson import ObjectId
from pymongo import MongoClient
try:
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=Path(__file__).resolve().parents[2] / ".env")
except ImportError:
    pass

MONGO_URI = os.getenv("MONGO_URI", "mongodb://admin:admin1234@localhost:27018/?authSource=admin")
DB_NAME = os.getenv("MONGO_DB_NAME", "506trackerdb")
ORS_API_KEY = os.getenv("ORS_API_KEY") or os.getenv("VITE_ORS_API_KEY")
ORS_URL = "https://api.openrouteservice.org/v2/directions/driving-car/geojson"

client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
db = client[DB_NAME]

random.seed(42)

CANTONES_CR = {
    "San Jose": {"capital": "San Jose", "cantones": {
        "San Jose": (9.9333, -84.0833), "Escazu": (9.9189, -84.1478),
        "Desamparados": (9.8987, -84.0656), "Puriscal": (9.8355, -84.3010),
        "Tarrazu": (9.6469, -84.0122), "Aserri": (9.8564, -84.0486),
        "Mora": (9.9128, -84.2394), "Goicoechea": (9.9526, -84.0500),
        "Santa Ana": (9.9280, -84.1828), "Alajuelita": (9.8994, -84.1114),
        "Vazquez de Coronado": (10.0000, -84.0167), "Acosta": (9.7594, -84.2233),
        "Tibas": (9.9628, -84.0783), "Moravia": (9.9639, -84.0500),
        "Montes de Oca": (9.9350, -84.0500), "Turrubares": (9.8481, -84.3689),
        "Dota": (9.6842, -83.9192), "Curridabat": (9.9147, -84.0333),
        "Perez Zeledon": (9.3717, -83.7042), "Leon Cortes": (9.6672, -83.9483)}},
    "Alajuela": {"capital": "Alajuela", "cantones": {
        "Alajuela": (10.0163, -84.2116), "San Ramon": (10.0910, -84.4762),
        "Grecia": (10.0715, -84.3159), "San Mateo": (9.9528, -84.4275),
        "Atenas": (9.9781, -84.3799), "Naranjo": (10.0989, -84.3811),
        "Palmares": (10.0567, -84.4356), "Poas": (10.1000, -84.2333),
        "Orotina": (9.9139, -84.5219), "San Carlos": (10.3236, -84.4272),
        "Zarcero": (10.1856, -84.4008), "Sarchi": (10.0783, -84.3492),
        "Upala": (10.8967, -85.0158), "Los Chiles": (11.0333, -84.7167),
        "Guatuso": (10.7597, -84.8319), "Rio Cuarto": (10.3833, -84.2667)}},
    "Cartago": {"capital": "Cartago", "cantones": {
        "Cartago": (9.8644, -83.9194), "Paraiso": (9.8394, -83.8656),
        "La Union": (9.9167, -83.9833), "Jimenez": (9.8386, -83.7728),
        "Turrialba": (9.9039, -83.6867), "Alvarado": (9.8483, -83.7981),
        "Oreamuno": (9.9089, -83.8558), "El Guarco": (9.8231, -83.9497)}},
    "Heredia": {"capital": "Heredia", "cantones": {
        "Heredia": (9.9989, -84.1169), "Barva": (10.0217, -84.1150),
        "Santo Domingo": (9.9689, -84.0919), "Santa Barbara": (10.0203, -84.1425),
        "San Rafael": (10.0217, -84.0975), "San Isidro": (10.0161, -84.0700),
        "Belen": (9.9808, -84.1858), "Flores": (9.9989, -84.1000),
        "San Pablo": (9.9856, -84.1006), "Sarapiqui": (10.4614, -84.0064)}},
    "Guanacaste": {"capital": "Liberia", "cantones": {
        "Liberia": (10.6346, -85.4370), "Nicoya": (10.1483, -85.4520),
        "Santa Cruz": (10.2661, -85.5886), "Bagaces": (10.5219, -85.2517),
        "Carrillo": (10.4394, -85.5747), "Canas": (10.4306, -85.0900),
        "Abangares": (10.3444, -84.9958), "Tilaran": (10.4661, -84.9678),
        "Nandayure": (9.9922, -85.2597), "La Cruz": (11.0842, -85.6300),
        "Hojancha": (10.0664, -85.3878)}},
    "Puntarenas": {"capital": "Puntarenas", "cantones": {
        "Puntarenas": (9.9767, -84.8386), "Esparza": (9.9942, -84.6631),
        "Buenos Aires": (9.1667, -83.3333), "Montes de Oro": (9.9989, -84.7269),
        "Osa": (8.9667, -83.5333), "Aguirre": (9.4319, -84.1611),
        "Golfito": (8.6417, -83.1614), "Coto Brus": (8.8228, -82.9642),
        "Parrita": (9.5192, -84.3169), "Corredores": (8.6217, -82.9319),
        "Garabito": (9.6142, -84.6297)}},
    "Limon": {"capital": "Limon", "cantones": {
        "Limon": (9.9908, -83.0331), "Pococi": (10.2167, -83.7947),
        "Siquirres": (10.0956, -83.5061), "Talamanca": (9.6167, -82.8500),
        "Matina": (10.0956, -83.2725), "Guacimo": (10.2094, -83.6875)}},
}

TIPO_LABEL = {"origen": "Origen", "parada": "Parada", "destino": "Destino"}


RUTAS_INTRA_PROVINCIA = [
    # Heredia
    ("Heredia", "San Isidro", "Heredia", "Santo Domingo"),
    ("Heredia", "San Rafael", "Heredia", "Heredia"),
    # San Jose
    ("San Jose", "San Jose", "San Jose", "Escazu"),
    ("San Jose", "San Jose", "San Jose", "Desamparados"),
    ("San Jose", "San Jose", "San Jose", "Curridabat"),
    # Alajuela
    ("Alajuela", "Alajuela", "Alajuela", "Grecia"),
    ("Alajuela", "Alajuela", "Alajuela", "Naranjo"),
    ("Alajuela", "Alajuela", "Alajuela", "San Ramon"),
    # Cartago
    ("Cartago", "Cartago", "Cartago", "Paraiso"),
    ("Cartago", "Cartago", "Cartago", "La Union"),
    ("Cartago", "Cartago", "Cartago", "Oreamuno"),
    # Guanacaste
    ("Guanacaste", "Liberia", "Guanacaste", "Santa Cruz"),
    ("Guanacaste", "Liberia", "Guanacaste", "Canas"),
    ("Guanacaste", "Liberia", "Guanacaste", "Nicoya"),
    # Puntarenas
    ("Puntarenas", "Puntarenas", "Puntarenas", "Esparza"),
    ("Puntarenas", "Puntarenas", "Puntarenas", "Aguirre"),
    ("Puntarenas", "Puntarenas", "Puntarenas", "Golfito"),
    # Limon
    ("Limon", "Limon", "Limon", "Pococi"),
    ("Limon", "Limon", "Limon", "Siquirres"),
    ("Limon", "Limon", "Limon", "Guacimo"),
]

RUTAS_INTER_PROVINCIA = [
    # Heredia
    ("Heredia", "Heredia", "San Jose", "San Jose"),
    ("Heredia", "Heredia", "Alajuela", "Alajuela"),
    ("Heredia", "Heredia", "Cartago", "Cartago"),
    # San Jose
    ("San Jose", "San Jose", "Heredia", "Heredia"),
    ("San Jose", "San Jose", "Alajuela", "Alajuela"),
    ("San Jose", "San Jose", "Cartago", "Cartago"),
    # Alajuela
    ("Alajuela", "Alajuela", "San Jose", "San Jose"),
    ("Alajuela", "Alajuela", "Heredia", "Heredia"),
    ("Alajuela", "Alajuela", "Cartago", "Cartago"),
    # Cartago
    ("Cartago", "Cartago", "San Jose", "San Jose"),
    ("Cartago", "Cartago", "Heredia", "Heredia"),
    ("Cartago", "Cartago", "Alajuela", "Alajuela"),
    # Guanacaste
    ("Guanacaste", "Liberia", "Puntarenas", "Puntarenas"),
    ("Guanacaste", "Liberia", "San Jose", "San Jose"),
    ("Guanacaste", "Liberia", "Alajuela", "Alajuela"),
    # Puntarenas
    ("Puntarenas", "Puntarenas", "San Jose", "San Jose"),
    ("Puntarenas", "Puntarenas", "Guanacaste", "Liberia"),
    ("Puntarenas", "Puntarenas", "Alajuela", "Alajuela"),
    # Limon
    ("Limon", "Limon", "San Jose", "San Jose"),
    ("Limon", "Limon", "Cartago", "Cartago"),
    ("Limon", "Limon", "Heredia", "Heredia"),
]


def haversine_km(a, b):
    R = 6371.0
    lat1, lng1 = a
    lat2, lng2 = b
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    s = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlng / 2) ** 2)
    return R * 2 * math.atan2(math.sqrt(s), math.sqrt(1 - s))


def interpolar_trazado(a, b, puntos_extra=4, jitter=0.004):
    trazado = []
    for i in range(puntos_extra + 1):
        t = i / puntos_extra
        lat = a[0] + (b[0] - a[0]) * t
        lng = a[1] + (b[1] - a[1]) * t
        if 0 < i < puntos_extra:
            lat += random.uniform(-jitter, jitter)
            lng += random.uniform(-jitter, jitter)
        trazado.append({"lat": round(lat, 5), "lng": round(lng, 5)})
    return trazado


def trazado_por_calles(coord_origen, coord_destino):
    if not ORS_API_KEY:
        return None
    try:
        res = requests.post(
            ORS_URL,
            headers={"Authorization": ORS_API_KEY, "Content-Type": "application/json"},
            json={
                "coordinates": [
                    [coord_origen[1], coord_origen[0]],
                    [coord_destino[1], coord_destino[0]],
                ],
                "radiuses": [-1, -1],
            },
            timeout=20,
        )
        if not res.ok:
            print(f"  ORS respondio {res.status_code}, uso linea recta")
            return None
        data = res.json()
        geom = data["features"][0]["geometry"]["coordinates"]
        summary = data["features"][0]["properties"]["summary"]
        trazado = [{"lat": round(lat, 5), "lng": round(lng, 5)} for lng, lat in geom]
        distancia_km = round(summary["distance"] / 1000, 1)
        tiempo_min = max(10, round(summary["duration"] / 60))
        return trazado, distancia_km, tiempo_min
    except Exception as e:
        print(f"  Error ORS: {e}, uso linea recta")
        return None


def abreviar(nombre, largo=3):
    letras = "".join(w[0] for w in nombre.split() if w[0].isalpha())
    if len(letras) >= largo:
        return letras[:largo].upper()
    return (nombre.replace(" ", "")[:largo]).upper()


def generar_tarifa(distancia_km):
    tarifa = 355 + distancia_km * 42
    tarifa = max(200, round(tarifa / 5) * 5)
    return int(tarifa)


def generar_horarios():
    primer_bus = f"{random.choice([4, 5]):02d}:{random.choice([0, 15, 30, 45]):02d}"
    ultimo_bus = f"{random.choice([20, 21, 22]):02d}:{random.choice([0, 15, 30, 45]):02d}"
    frecuencia = random.choice([15, 20, 25, 30, 40, 60])
    return primer_bus, ultimo_bus, frecuencia


def construir_rutas():
    rutas = []
    codigos_usados = set()
    pares = RUTAS_INTRA_PROVINCIA + RUTAS_INTER_PROVINCIA

    for i, (prov_o, canton_o, prov_d, canton_d) in enumerate(pares):
        coord_origen = CANTONES_CR[prov_o]["cantones"][canton_o]
        coord_destino = CANTONES_CR[prov_d]["cantones"][canton_d]

        print(f"[{i + 1}/{len(pares)}] {canton_o} -> {canton_d}")

        resultado_ors = trazado_por_calles(coord_origen, coord_destino)
        if resultado_ors:
            trazado, distancia_km, tiempo_min = resultado_ors
            time.sleep(1.6)  # respeta el rate limit del free tier de ORS
        else:
            distancia_recta = haversine_km(coord_origen, coord_destino)
            distancia_km = round(distancia_recta * 1.35, 1)
            tiempo_min = max(10, round((distancia_km / 28) * 60))
            trazado = interpolar_trazado(coord_origen, coord_destino, puntos_extra=4)

        base_cod = f"{abreviar(canton_o)}-{abreviar(canton_d)}"
        codigo = base_cod
        n = 1
        while codigo in codigos_usados:
            n += 1
            codigo = f"{base_cod}-{n:02d}"
        codigos_usados.add(codigo)

        primer_bus, ultimo_bus, frecuencia = generar_horarios()

        rutas.append({
            "nombre": f"{canton_o} - {canton_d}",
            "codigo": codigo,
            "descripcion": f"Ruta de {canton_o} ({prov_o}) hacia {canton_d} ({prov_d})",
            "primer_bus": primer_bus,
            "ultimo_bus": ultimo_bus,
            "frecuencia": frecuencia,
            "tarifa": generar_tarifa(distancia_km),
            "distancia_km": distancia_km,
            "tiempo_min": tiempo_min,
            "trazado": trazado,
            "canton_origen": canton_o,
            "provincia_origen": prov_o,
            "canton_destino": canton_d,
            "provincia_destino": prov_d,
            "activa": True,
            "createdAt": datetime.utcnow(),
        })

    return rutas


def construir_paradas(ruta, route_id):
    trazado = ruta["trazado"]
    total = len(trazado)

    puntos = [(trazado[0], "origen", ruta["canton_origen"], ruta["provincia_origen"])]

    if total > 2:
        cantidad = 2 if total > 6 else 1
        idx_disponibles = list(range(1, total - 1))
        random.shuffle(idx_disponibles)
        for idx in sorted(idx_disponibles[:cantidad]):
            puntos.append((trazado[idx], "parada", ruta["canton_origen"], ruta["provincia_origen"]))

    puntos.append((trazado[-1], "destino", ruta["canton_destino"], ruta["provincia_destino"]))

    paradas = []
    for i, (punto, tipo, canton, provincia) in enumerate(puntos):
        paradas.append({
            "nombre": f"{TIPO_LABEL[tipo]} - {canton}" if tipo != "parada" else f"Parada {i}",
            "lat": punto["lat"],
            "lng": punto["lng"],
            "location": {"type": "Point", "coordinates": [punto["lng"], punto["lat"]]},
            "tipo": tipo,
            "orden": i,
            "canton": canton,
            "provincia": provincia,
            "route_id": str(route_id),
            "createdAt": datetime.utcnow(),
        })
    return paradas


def limpiar_rutas_existentes():
    a_borrar = list(db.rutas.find({"_id": {"$ne": RUTA_A_CONSERVAR_ID}}, {"_id": 1}))
    ids_a_borrar = [r["_id"] for r in a_borrar]

    if not ids_a_borrar:
        print("No habia otras rutas que borrar.")
        return

    route_ids_str = [str(i) for i in ids_a_borrar]
    paradas_borradas = db.paradas.delete_many({"route_id": {"$in": route_ids_str}})
    rutas_borradas = db.rutas.delete_many({"_id": {"$in": ids_a_borrar}})

    print(f"Borradas {rutas_borradas.deleted_count} rutas y {paradas_borradas.deleted_count} paradas ")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--yes", action="store_true")
    args = parser.parse_args()

    if not ORS_API_KEY:
        print("Aviso: no hay ORS_API_KEY configurada, todas las rutas se generaran en linea recta.")

    conservar_doc = db.rutas.find_one({"_id": RUTA_A_CONSERVAR_ID})
    if not conservar_doc:
        print("no rutas en la BD.")

    rutas = construir_rutas()
    print(f"Se generaron {len(rutas)} rutas nuevas. Conectando a: {DB_NAME}")

    if not args.yes:
        resp = input(
            f"insertar {len(rutas)} rutas nuevas en '{DB_NAME}'. Continuar? [y/N] "
        )
        if resp.strip().lower() != "y":
            print("Cancelado.")
            return

    limpiar_rutas_existentes()

    insertadas = 0
    for ruta in rutas:
        ruta["_id"] = ObjectId()
        db.rutas.insert_one(ruta)
        paradas = construir_paradas(ruta, ruta["_id"])
        if paradas:
            db.paradas.insert_many(paradas)
        insertadas += 1

    print(f" Insertadas: {insertadas}. Total en BD ahora: {insertadas + 1} ")


if __name__ == "__main__":
    main()