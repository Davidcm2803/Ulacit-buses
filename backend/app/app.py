from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from mangum import Mangum

from app.routes.routes import router as routes_router
from app.routes.stops import router as stops_router
from app.routes.history import router as history_router
from app.Mongo.indexes import crear_indices
from app.routes.auth_routes import router as auth_route
from app.services.firebase_service import initialize_firebase
from app.routes.payments import router as payments_router

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

origins = [
    "http://localhost:5174",
    "http://localhost:5173",
    "aca el de aws",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(history_router)
app.include_router(auth_route)
app.include_router(routes_router)
app.include_router(stops_router)
app.include_router(payments_router)



@app.on_event("startup")
def on_startup():
    initialize_firebase()
    crear_indices()

@app.get("/health")
async def health():
    return {"status": "ok"}

# Entry point para AWS Lambda
handler = Mangum(app)