db = db.getSiblingDB('ulacit_buses');

db.createCollection('buses');
db.createCollection('routes');
db.createCollection('users');
db.createCollection('history');

db.routes.createIndex({ name: 1 });
db.buses.createIndex({ plate: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { unique: true });
db.history.createIndex({ user_id: 1 });

db.routes.insertMany([
  {
    name: 'Ruta 1 - Centro a Desamparados',
    origin: 'San Jose Centro',
    destination: 'Desamparados',
    coordinates: [
      { lat: 9.9281, lng: -84.0907 },
      { lat: 9.9150, lng: -84.0800 },
      { lat: 9.9010, lng: -84.0720 }
    ],
    active: true
  },
  {
    name: 'Ruta 2 - San Jose a Cartago',
    origin: 'San Jose',
    destination: 'Cartago',
    coordinates: [
      { lat: 9.9281, lng: -84.0907 },
      { lat: 9.8900, lng: -84.0200 },
      { lat: 9.8640, lng: -83.9195 }
    ],
    active: true
  }
]);

print('MongoDB ulacit_buses inicializado');
