from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict

app = FastAPI(title="Ascintra API", version="0.1.0")

# CORS for local dev and Compose
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


from app.routes_generated import router as generated_router
from app.controllers.inventory import router as inventory_router
from app.controllers.accounts import router as accounts_router

# Include more specific routers first to avoid accidental overrides
app.include_router(inventory_router)
app.include_router(accounts_router)
app.include_router(generated_router)


@app.get("/healthz")
async def health() -> Dict[str, str]:
    return {"status": "ok"}
