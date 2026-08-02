# 506Tracker

Plataforma para buses para Costa Rica en AWS con arquitectura serverless.

## Stack

**Backend:** FastAPI (Python 3.11) + Mangum, ejecutado como AWS Lambda detrás de API Gateway (HTTP API).

**Frontend:** React + Vite, servido como sitio estático desde S3 detrás de CloudFront.

**Base de datos:** MongoDB Atlas.

**Autenticación:** Firebase Authentication.

**Pagos:** Stripe.

**Infraestructura:** Terraform (recursos AWS gestionados como código).

---

## Arquitectura

```
┌─────────────┐      ┌──────────────┐      ┌─────────────────┐      ┌────────────────┐
│  CloudFront │◄─────│   S3 Bucket   │      │  API Gateway    │◄─────│  AWS Lambda      │
│ (CDN + TLS) │      │  (frontend)   │      │  (HTTP API)     │      │  (FastAPI +      │
└──────┬──────┘      └──────────────┘      └────────┬────────┘      │   Mangum)        │
       │                                             │               └────────┬────────┘
       │  Static assets (React build)                │  /api/*                │
       ▼                                             ▼                        ▼
   Navegador ───────────────────────────────► Backend API ──────► MongoDB Atlas
                                                                   Firebase Admin SDK
                                                                   Stripe API
```

- El **frontend** se compila con `vite build` y se sube como archivos estáticos a S3. CloudFront distribuye ese contenido con caché y HTTPS.
- El **backend** corre como una única Lambda que envuelve toda la app de FastAPI mediante Mangum, expuesta a través de una HTTP API de API Gateway.
- La comunicación entre frontend y backend es 100% vía API REST (`/api/*`); no hay SSR ni renderizado del lado del servidor.

---

## Recursos AWS

| Recurso | Nombre / ID | Propósito |
|---|---|---|
| Lambda | `506tracker-dev-backend` | Ejecuta la app FastAPI completa |
| API Gateway (HTTP API) | `506tracker-dev-api` | Expone el backend vía HTTPS |
| S3 (frontend) | `506tracker-dev-frontend` | Hosting estático del build de React |
| S3 (deploys) | `506tracker-dev-lambda-deploys` | Almacena los paquetes `.zip` del backend antes de actualizarlo en Lambda |
| CloudFront | Distribución `E33UMGNZKLQ2A5` | CDN y HTTPS para el frontend |
| IAM Role | `506tracker-dev-lambda-exec` | Rol de ejecución de la Lambda |

Región: `us-east-1`. Recursos gestionados con Terraform.

---

## Migración a AWS

El proyecto corría originalmente como una app FastAPI tradicional (Uvicorn) contra Mongo local. La migración a serverless implicó los siguientes cambios sobre el código base:

### 1. Adaptar FastAPI para correr en Lambda

Se agregó `Mangum` como adaptador ASGI → Lambda. El handler vive en `app/aws/lambda_handler.py` e importa la **instancia** de la app (`app.app.app`), no el módulo `app`:

```python
from app.app import app as fastapi_app
from mangum import Mangum

handler = Mangum(fastapi_app)
```

### 2. Ajustar el ruteo para el prefijo `/api`

API Gateway (HTTP API, payload format 2.0) no recorta automáticamente el prefijo de la ruta antes de invocar la Lambda. Por eso todas las rutas de la aplicación se agruparon bajo un único `APIRouter(prefix="/api")` en `app.py`, en vez de depender de que API Gateway lo eliminara.

### 3. Manejo de CORS

API Gateway está configurado con una ruta `ANY /api/{proxy+}`, que envía **todos** los métodos —incluido el preflight `OPTIONS`— directo a la Lambda. Esto significa que la configuración de CORS a nivel de API Gateway no alcanza a interceptar el preflight antes de que llegue a FastAPI. La solución fue mantener `CORSMiddleware` activo en la propia aplicación FastAPI, de forma que sea la app la que responda correctamente tanto las peticiones reales como los preflights.

### 4. Empaquetado del backend

Dado el tamaño de las dependencias (~60 MB comprimido), el deploy no se hace por subida directa a Lambda sino vía S3:

```
pip install -r requirements.txt --target .lambda_build \
    --platform manylinux2014_x86_64 --implementation cp \
    --python-version 3.11 --only-binary=:all: --upgrade

Copy-Item -Recurse -Force app .lambda_build\app
Compress-Archive -Path .lambda_build\* -DestinationPath lambda_package.zip -Force

aws s3 cp lambda_package.zip s3://506tracker-dev-lambda-deploys/
aws lambda update-function-code \
    --function-name 506tracker-dev-backend \
    --s3-bucket 506tracker-dev-lambda-deploys \
    --s3-key lambda_package.zip \
    --region us-east-1
```

> Antes de reconstruir el paquete, conviene borrar `.lambda_build/` si ya existía de una corrida anterior — `Copy-Item -Recurse` puede anidar carpetas en vez de sobreescribirlas si el destino ya existe, arrastrando código viejo al zip final.

### 5. Variables de entorno

Configuradas directamente en la Lambda (no se versionan en el repo):

- `JWT_SECRET`
- `ENVIRONMENT`
- `MONGO_URI`
- `FIREBASE_CREDENTIALS`
- `STRIPE_SECRET_KEY`

### 6. Frontend

El build de producción (`npm run build` / `vite build`) apunta la variable `VITE_API_URL` a la URL pública de API Gateway. El resultado (`dist/`) se sincroniza a S3 y se invalida la caché de CloudFront:

```
npm run build

aws s3 sync dist/ s3://506tracker-dev-frontend/ --delete
aws cloudfront create-invalidation --distribution-id E33UMGNZKLQ2A5 --paths "/*"
```

La invalidación es necesaria porque CloudFront cachea agresivamente los assets estáticos; sin ella, los usuarios pueden seguir viendo una versión anterior del sitio durante minutos u horas.

---

## Estructura del proyecto

```
Ulacit-buses/
├── README.md
├── backend/
│   ├── requirements.txt
│   ├── DB/
│   │   ├── docker-compose.yaml
│   │   └── mongo-init/
│   │       └── init.js
│   └── app/
│       ├── app.py
│       ├── config.py
│       ├── aws/
│       │   ├── lambda_handler.py
│       │   ├── cloudwatch_logger.py
│       │   ├── s3_client.py
│       │   └── secrets.py
│       ├── dependencies/
│       │   └── auth_dependencies.py
│       ├── middlewares/
│       │   ├── auth_middleware.py
│       │   └── error_handler.py
│       ├── models/
│       │   ├── bus.py
│       │   ├── history.py
│       │   ├── payment.py
│       │   ├── route.py
│       │   ├── ticket.py
│       │   └── user_model.py
│       ├── Mongo/
│       │   ├── connection.py
│       │   ├── indexes.py
│       │   └── seed.py
│       ├── routes/
│       │   ├── auth_routes.py
│       │   ├── history.py
│       │   ├── payments.py
│       │   ├── routes.py
│       │   ├── stops.py
│       │   └── tickets.py
│       ├── services/
│       │   ├── firebase_service.py
│       │   ├── history_service.py
│       │   ├── payment_service.py
│       │   ├── route_service.py
│       │   ├── stop_service.py
│       │   ├── ticket_service.py
│       │   └── user_service.py
│       ├── test/
│       │   ├── test_buses.py
│       │   ├── test_routes.py
│       │   └── test_users.py
│       └── utils/
│           ├── pagination.py
│           └── validators.py
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── eslint.config.js
    ├── README.md
    ├── public/
    │   ├── Busicon.png
    │   ├── favicon.svg
    │   ├── icons.svg
    │   └── data/
    │       └── cantones-cr.json
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── assets/
        │   ├── hero.png
        │   ├── react.svg
        │   └── vite.svg
        ├── config/
        │   └── api.js
        ├── context/
        │   └── CartContext.jsx
        ├── hooks/
        │   ├── Useadminruta.js
        │   ├── useDarkMode.js
        │   ├── useHistory.js
        │   ├── useRouteLayout.js
        │   └── useRoutes.js
        ├── lib/
        │   ├── firebase.js
        │   ├── geoCR.js
        │   ├── routesData.js
        │   └── utils.js
        ├── services/
        │   └── authService.js
        ├── components/
        │   ├── admin/
        │   │   ├── AdminMapPicker.jsx
        │   │   ├── AdminModePicker.jsx
        │   │   ├── AdminRouteForm.jsx
        │   │   ├── AdminRouteSummary.jsx
        │   │   ├── AdminSidebar.jsx
        │   │   └── AdminStopList.jsx
        │   ├── layout/
        │   │   ├── AuthModal.jsx
        │   │   ├── NavBar.jsx
        │   │   └── ProtectedRoute.jsx
        │   ├── routes/
        │   │   ├── PaymentForm.jsx
        │   │   ├── RouteCard.jsx
        │   │   ├── RouteMap.jsx
        │   │   ├── RouteSearch.jsx
        │   │   └── StopList.jsx
        │   └── ui/
        │       ├── AuthButtons.jsx
        │       ├── Button.jsx
        │       ├── Card.jsx
        │       └── SelectField.jsx
        └── pages/
            ├── BusRoutes.jsx
            ├── Cart.jsx
            ├── History.jsx
            ├── Home.jsx
            ├── RouteDetails.jsx
            └── Admin/
                ├── AdminCrearRuta.jsx
                ├── AdminDashboard.jsx
                ├── AdminLayout.jsx
                ├── AdminParadas.jsx
                └── AdminRutas.jsx
```

---

## Flujo de despliegue

### Backend

1. Modificar código en `backend/app/`.
2. Reconstruir dependencias y empaquetar (`.lambda_build/` + `lambda_package.zip`).
3. Subir el paquete a S3.
4. Actualizar el código de la Lambda apuntando al paquete recién subido.
5. Verificar el endpoint de salud (`/api/health`) y revisar logs en CloudWatch si algo falla.

### Frontend

1. Ajustar `VITE_API_URL` en `.env` si cambió la URL del backend.
2. Generar build de producción.
3. Sincronizar `dist/` con el bucket S3 (con `--delete` para limpiar archivos obsoletos).
4. Invalidar la caché de CloudFront.
5. Verificar en el navegador que las llamadas a la API apunten al dominio correcto y no haya errores de CORS en consola.

---

## Notas técnicas relevantes

- API Gateway usa una única ruta `ANY /api/{proxy+}` que reenvía todo a la Lambda; no hay rutas individuales por método ni mocks de CORS a nivel de API Gateway.
- El manejo de CORS ocurre íntegramente dentro de la aplicación FastAPI.
- El certificado y dominio de CloudFront pueden reemplazarse por un dominio propio dado de alta en ACM (región `us-east-1`, requisito de CloudFront) y asociado como Alternate Domain Name en la distribución.
