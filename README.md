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
│
├── backend/
│   │
│   ├── app/
│   │   │
│   │   ├── aws/
│   │   │   ├── __init__.py
│   │   │   ├── cloudwatch_logger.py
│   │   │   ├── lambda_handler.py
│   │   │   ├── s3_client.py
│   │   │   └── secrets.py
│   │   │
│   │   ├── DB/
│   │   │   ├── __init__.py
│   │   │   ├── connection.py
│   │   │   ├── indexes.py
│   │   │   └── seed.py
│   │   │
│   │   ├── middlewares/
│   │   │   ├── auth_middleware.py
│   │   │   ├── cors_middleware.py
│   │   │   └── logging_middleware.py
│   │   │
│   │   ├── models/
│   │   │   ├── ruta.py
│   │   │   ├── parada.py
│   │   │   ├── usuario.py
│   │   │   └── historial.py
│   │   │
│   │   ├── routes/
│   │   │   ├── rutas_router.py
│   │   │   ├── paradas_router.py
│   │   │   ├── usuarios_router.py
│   │   │   └── historial_router.py
│   │   │
│   │   ├── services/
│   │   │   ├── ruta_service.py
│   │   │   ├── mapa_service.py
│   │   │   ├── usuario_service.py
│   │   │   └── historial_service.py
│   │   │
│   │   ├── test/
│   │   │   ├── test_rutas.py
│   │   │   ├── test_usuarios.py
│   │   │   └── test_historial.py
│   │   │
│   │   ├── utils/
│   │   │   ├── __init__.py
│   │   │   ├── jwt_utils.py
│   │   │   ├── response_utils.py
│   │   │   └── validators.py
│   │   │
│   │   ├── __init__.py
│   │   ├── app.py
│   │   └── config.py
│   │
│   ├── docker/
│   │   ├── docker-compose.yml
│   │   ├── Dockerfile
│   │   └── mongo-init.js
│   │
│   ├── .env
│   ├── .gitignore
│   └── requirements.txt
│
├── frontend/
│   │
│   ├── public/
│   │
│   └── src/
│       │
│       ├── assets/
│       │   ├── hero.png
│       │   ├── react.svg
│       │   └── vite.svg
│       │
│       ├── components/
│       │   ├── MapaRutas/
│       │   │   ├── MapaRutas.jsx
│       │   │   └── MapaRutas.css
│       │   │
│       │   ├── BuscadorRutas/
│       │   ├── TarjetaRuta/
│       │   ├── ListaParadas/
│       │   └── Navbar/
│       │
│       ├── hooks/
│       │   ├── useRutas.js
│       │   └── useHistorial.js
│       │
│       ├── lib/
│       │   ├── api.js
│       │   └── rutasData.js
│       │
│       ├── pages/
│       │   ├── Home/
│       │   ├── Rutas/
│       │   ├── DetalleRuta/
│       │   ├── Historial/
│       │   └── Login/
│       │
│       ├── App.css
│       ├── App.jsx
│       ├── index.css
│       └── main.jsx
│
│   ├── .env
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── .gitignore
└── README.md

---

*Grupo 03 — Arquitectura en la Nube*
