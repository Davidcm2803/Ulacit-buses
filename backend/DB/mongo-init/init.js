db = db.getSiblingDB("506trackerdb");

/* Colecciones iniciales */
db.createCollection("rutas");
db.createCollection("paradas");
db.createCollection("usuarios");
db.createCollection("historial");
db.createCollection("tickets");

// Usuario de prueba
const usuario = db.usuarios.insertOne({
    _id: ObjectId(),
    username: "Carlos",
    email: "carlos@email.com",
    password: "hashed_password", // hay que hacer hash con bcrypt o jwt
    role: "admin", // "admin" | "user"
    createdAt: new Date()
});

// Ruta de ejemplo: San José -> Escazú
const ruta = db.rutas.insertOne({
    _id: ObjectId(),
    nombre: "San José - Escazú",
    codigo: "SJ-ES-01",
    descripcion: "Ruta directa de San José centro hacia Escazú",
    primer_bus: "05:00",
    ultimo_bus: "22:00",
    frecuencia: 25,          // minutos, el front arma el dropdown de salidas con esto
    tarifa: 665,
    distancia_km: 8.4,
    tiempo_min: 22,
    trazado: [
        { lat: 9.9333, lng: -84.0833 },
        { lat: 9.9350, lng: -84.0900 },
        { lat: 9.9360, lng: -84.0970 },
        { lat: 9.9381, lng: -84.1057 },
        { lat: 9.9300, lng: -84.1150 },
        { lat: 9.9200, lng: -84.1250 },
        { lat: 9.9167, lng: -84.1333 }
    ],
    canton_origen: "San José",
    provincia_origen: "San José",
    canton_destino: "Escazú",
    provincia_destino: "San José",
    activa: true,
    createdAt: new Date()
});

// Paradas de la ruta (referencian route_id, como hace stopsService.create)
const paradaOrigen = db.paradas.insertOne({
    _id: ObjectId(),
    nombre: "Terminal 7-10",
    lat: 9.9333,
    lng: -84.0833,
    tipo: "origen",
    orden: 0,
    canton: "San José",
    provincia: "San José",
    route_id: ruta.insertedId.toString(),
    createdAt: new Date()
});

const paradaIntermedia = db.paradas.insertOne({
    _id: ObjectId(),
    nombre: "Parada La Sabana",
    lat: 9.9381,
    lng: -84.1057,
    tipo: "parada",
    orden: 1,
    canton: "San José",
    provincia: "San José",
    route_id: ruta.insertedId.toString(),
    createdAt: new Date()
});

const paradaDestino = db.paradas.insertOne({
    _id: ObjectId(),
    nombre: "Terminal Escazú",
    lat: 9.9167,
    lng: -84.1333,
    tipo: "destino",
    orden: 2,
    canton: "Escazú",
    provincia: "San José",
    route_id: ruta.insertedId.toString(),
    createdAt: new Date()
});

// Historial de rutas (opcional)
const historial = db.historial.insertOne({
    _id: ObjectId(),
    usuario: usuario.insertedId,
    ruta: ruta.insertedId,
    origen_buscado: "San José",
    destino_buscado: "Escazú",
    consultado_en: new Date()
});

// Ticket de compra, sujeto a ruta + hora de salida específica
const ticket = db.tickets.insertOne({
    _id: ObjectId(),
    usuario_id: usuario.insertedId,
    ruta_id: ruta.insertedId,
    stripe_payment_id: "pi_test_xxx",
    fecha_viaje: new Date("2025-06-01"),
    hora_salida: "15:00",       // solo sirve para esa salida
    estado: "activo",           // "activo" | "expirado"
    validado_en: null,          // se llena cuando el chofer escanea el QR
    createdAt: new Date()
});