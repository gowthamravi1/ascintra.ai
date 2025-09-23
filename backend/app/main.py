from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

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
from app.controllers.discovery import router as discovery_router
from app.controllers.posture import router as posture_router
from app.controllers.drift import router as drift_router
from app.controllers.navigation import router as navigation_router
from app.controllers.asset_details import router as asset_details_router
from app.controllers.compliance import router as compliance_router
from app.controllers.overview import router as overview_router

# Include more specific routers first to avoid accidental overrides
app.include_router(inventory_router)
app.include_router(accounts_router)
app.include_router(discovery_router)
app.include_router(posture_router)
app.include_router(drift_router)
app.include_router(navigation_router)
app.include_router(asset_details_router)
app.include_router(compliance_router)
app.include_router(overview_router)
app.include_router(generated_router)


@app.get("/healthz")
async def health() -> Dict[str, str]:
    return {"status": "ok"}
