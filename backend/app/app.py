from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

from app.routes.history import router as history_router
from app.Mongo.indexes import crear_indices
from app.routes.auth_routes import router as auth_route
from app.services.firebase_service import initialize_firebase

app = FastAPI(
    title="Ulacit Buses API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(history_router)
app.include_router(auth_route)

@app.on_event("startup")
def on_startup():
    initialize_firebase()
    crear_indices()

@app.get("/health")
async def health():
    return {"status": "ok"}

# Entry point para AWS Lambda
handler = Mangum(app)