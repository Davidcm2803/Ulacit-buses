from fastapi import FastAPI, Request, APIRouter
from fastapi.responses import Response
from mangum import Mangum

from app.routes.routes import router as routes_router
from app.routes.stops import router as stops_router
from app.routes.history import router as history_router
from app.Mongo.indexes import crear_indices
from app.routes.auth_routes import router as auth_route
from app.services.firebase_service import initialize_firebase
from app.routes.payments import router as payments_router
from app.routes.tickets import router as tickets_router

app = FastAPI(
    title="Ulacit Buses API",
    version="1.0.0",
    redirect_slashes=False
)

@app.middleware("http")
async def add_coop_header(request: Request, call_next):
    response = await call_next(request)
    response.headers["Cross-Origin-Opener-Policy"] = "same-origin-allow-popups"
    return response

api_router = APIRouter(prefix="/api")

api_router.include_router(history_router)
api_router.include_router(auth_route)
api_router.include_router(routes_router)
api_router.include_router(stops_router)
api_router.include_router(payments_router)
api_router.include_router(tickets_router)

@api_router.get("/health")
async def health():
    return {"status": "ok"}

app.include_router(api_router)

@app.on_event("startup")
def on_startup():
    initialize_firebase()
    crear_indices()

# Entry point para AWS Lambda
handler = Mangum(app)