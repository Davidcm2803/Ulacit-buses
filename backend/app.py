from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

from routes.history import router as history_router
from DB.indexes import crear_indices

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

@app.on_event("startup")
def on_startup():
    crear_indices()

@app.get("/health")
async def health():
    return {"status": "ok"}

handler = Mangum(app)