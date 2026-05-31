from fastapi import FastAPI
from mangum import Mangum

app = FastAPI(
    title="Ulacit Buses API",
    version="1.0.0"
)

@app.get("/health")
async def health():
    return {"status": "ok"}

# Entry point para AWS Lambda
handler = Mangum(app)
