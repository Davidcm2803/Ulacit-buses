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
    password: "hashed_password", // hay que hacer hash con bcrypt o jtk
    role: "admin", // "admin"  "user"
    createdAt: new Date()
});

// Paradas de ejemplo, usando Openrouteservice para longitud y latitud
const paradaTerminalCentral = db.paradas.insertOne({
    _id: ObjectId(),
    nombre: "Terminal 7-10",
    descripcion: "Terminal central de buses, San José",
    coordenadas: {
        lat: 9.9333,
        lng: -84.0833
    },
    createdAt: new Date()
});

const paradaSabana = db.paradas.insertOne({
    _id: ObjectId(),
    nombre: "Parada La Sabana",
    descripcion: "Frente al Estadio Nacional",
    coordenadas: {
        lat: 9.9381,
        lng: -84.1057
    },
    createdAt: new Date()
});

const paradaEscazu = db.paradas.insertOne({
    _id: ObjectId(),
    nombre: "Terminal Escazú",
    descripcion: "Terminal final de la ruta, Escazú centro",
    coordenadas: {
        lat: 9.9167,
        lng: -84.1333
    },
    createdAt: new Date()
});

// Ruta de ejemplo, San José a Escazú, usando Openrouteservice para longitud y latitud
const ruta = db.rutas.insertOne({
    _id: ObjectId(),
    ruta_nombre: "San José - Escazú",
    origen: "Terminal 7-10, San José",
    destino: "Terminal Escazú",
    descripcion: "Ruta directa de San José centro hacia Escazú",
    horario: {
        primer_bus: "05:00",        
        ultimo_bus: "22:00",        
        frecuencia_bus: 25        // en el front calculamos todas las salidas con esos 3 datos para montar un dropdown con todas las salidas de buses
    },
    tarifa: 665,
    paradas: [
        paradaTerminalCentral.insertedId,
        paradaSabana.insertedId,
        paradaEscazu.insertedId
    ],
    coordenadas_recorrido: [
        { lat: 9.9333, lng: -84.0833 },
        { lat: 9.9350, lng: -84.0900 },
        { lat: 9.9360, lng: -84.0970 },
        { lat: 9.9381, lng: -84.1057 },
        { lat: 9.9300, lng: -84.1150 },
        { lat: 9.9200, lng: -84.1250 },
        { lat: 9.9167, lng: -84.1333 }
    ],
    activa: true,
    createdAt: new Date()
});

// Historial de rutas (OPCIONAAAL)
const historial = db.historial.insertOne({
    _id: ObjectId(),
    usuario: usuario.insertedId,
    ruta: ruta.insertedId,
    origen_buscado: "San José",
    destino_buscado: "Escazú",
    consultado_en: new Date()
});

// Ticket de compra que estan sujetos a la ruta y la hora ejemplo si pago bus de 3:00 solo sive para ese
const ticket = db.tickets.insertOne({
    _id: ObjectId(),
    usuario_id: usuario.insertedId,
    ruta_id: ruta.insertedId,
    stripe_payment_id: "pi_test_xxx",
    fecha_viaje: new Date("2025-06-01"),
    hora_salida: "15:00",       // si intenta usarlo en otra salida se peta
    estado: "activo",           // "activo o expirado" 
    validado_en: null,          // se valida cuando el chofer escanea el QR
    createdAt: new Date()
});