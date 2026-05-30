# 506Tracker

Plataforma web de consulta de rutas de transporte publico para Costa Rica. Permite visualizar recorridos de buses en un mapa interactivo con coordenadas hardcodeadas, buscar rutas por origen y destino, y revisar historial de consultas por usuario. Construida sobre arquitectura serverless en AWS con frontend en React y backend en Python con FastAPI.

---

## Servicios Cloud (AWS)

| Servicio      | Uso                                          |
|---------------|----------------------------------------------|
| Lambda        | Ejecucion de microservicios serverless       |
| API Gateway   | Gestion y exposicion de endpoints REST       |
| S3            | Hosting del frontend y almacenamiento de assets |
| CloudFront    | CDN para distribucion del frontend           |
| CloudWatch    | Logs, metricas y alertas                     |
| MongoDB Atlas | Base de datos NoSQL (fuera de AWS)           |

---

## Estructura del Proyecto

```
506Tracker/
|
|-- backend/
|   |-- aws/
|   |   |-- __init__.py
|   |   |-- cloudwatch_logger.py       # Logger centralizado hacia CloudWatch
|   |   |-- lambda_handler.py          # Entry point para AWS Lambda via Mangum
|   |   |-- s3_client.py               # Cliente S3 para assets y logs
|   |   +-- secrets.py                 # Gestion de AWS Secrets Manager
|   |
|   |-- DB/
|   |   |-- __init__.py
|   |   |-- connection.py              # Conexion a MongoDB Atlas
|   |   |-- indexes.py                 # Definicion de indices en colecciones
|   |   +-- seed.py                    # Datos iniciales (rutas hardcodeadas CR)
|   |
|   |-- docker/
|   |   |-- docker-compose.yml         # Orquestacion para desarrollo local
|   |   |-- Dockerfile                 # Imagen del backend
|   |   +-- mongo-init.js              # Script de inicializacion de MongoDB local
|   |
|   |-- middlewares/
|   |   |-- auth_middleware.py         # Validacion de tokens JWT
|   |   |-- cors_middleware.py         # Configuracion CORS
|   |   +-- logging_middleware.py      # Log de requests y responses
|   |
|   |-- models/
|   |   |-- ruta.py                    # Modelo Pydantic de Ruta
|   |   |-- parada.py                  # Modelo Pydantic de Parada
|   |   |-- usuario.py                 # Modelo Pydantic de Usuario
|   |   +-- historial.py               # Modelo Pydantic de Historial
|   |
|   |-- routes/
|   |   |-- rutas_router.py            # Endpoints de rutas de bus
|   |   |-- paradas_router.py          # Endpoints de paradas
|   |   |-- usuarios_router.py         # Endpoints de autenticacion
|   |   +-- historial_router.py        # Endpoints de historial
|   |
|   |-- services/
|   |   |-- ruta_service.py            # Logica de rutas y coordenadas
|   |   |-- mapa_service.py            # Procesamiento de coordenadas para mapa
|   |   |-- usuario_service.py         # Gestion de usuarios
|   |   +-- historial_service.py       # Registro y consulta de historial
|   |
|   |-- test/
|   |   |-- test_rutas.py
|   |   |-- test_usuarios.py
|   |   +-- test_historial.py
|   |
|   |-- utils/
|   |   |-- jwt_utils.py               # Generacion y validacion JWT
|   |   |-- response_utils.py          # Formato estandar de respuestas
|   |   +-- validators.py              # Validaciones comunes
|   |
|   |-- .env
|   |-- .gitignore
|   |-- app.py                         # Instancia FastAPI principal
|   |-- config.py                      # Configuracion centralizada
|   +-- requirements.txt
|
|-- frontend/
|   |-- public/
|   |
|   +-- src/
|       |-- assets/
|       |   |-- hero.png
|       |   |-- react.svg
|       |   +-- vite.svg
|       |
|       |-- components/
|       |   |-- MapaRutas/
|       |   |   |-- MapaRutas.jsx      # Mapa Leaflet con polylines de rutas CR
|       |   |   +-- MapaRutas.css
|       |   |-- BuscadorRutas/         # Busqueda por origen y destino
|       |   |-- TarjetaRuta/           # Card de informacion de ruta
|       |   |-- ListaParadas/          # Lista de paradas de una ruta
|       |   +-- Navbar/
|       |
|       |-- hooks/
|       |   |-- useRutas.js            # Hook para fetch de rutas
|       |   +-- useHistorial.js        # Hook para historial de usuario
|       |
|       |-- lib/
|       |   |-- api.js                 # Cliente Axios configurado
|       |   +-- rutasData.js           # Coordenadas hardcodeadas de rutas CR
|       |
|       |-- pages/
|       |   |-- Home/                  # Pagina principal con mapa
|       |   |-- Rutas/                 # Listado de todas las rutas
|       |   |-- DetalleRuta/           # Detalle y mapa de una ruta especifica
|       |   |-- Historial/             # Historial de recorridos del usuario
|       |   +-- Login/
|       |
|       |-- App.css
|       |-- App.jsx
|       |-- index.css
|       +-- main.jsx
|
|   |-- .env
|   |-- .gitignore
|   |-- eslint.config.js
|   |-- index.html
|   |-- package.json
|   |-- package-lock.json
|   +-- vite.config.js
|
|-- .gitignore
+-- README.md
```

---

*Grupo 03 — Arquitectura en la Nube*
