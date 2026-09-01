"""
JEEVAN AI — Predictive Analytics Endpoints

Endpoints for crowd density metrics and anomaly detection.
In Phase 3, these return mock payload schemas matching the SRS §9.3 requirements.
"""

from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.api.dependencies import CurrentUser, require_role

router = APIRouter(tags=["analytics"])

CommandOrHigher = Annotated[
    CurrentUser, Depends(require_role(["COMMAND", "ADMIN"]))
]

# --- Mock Schemas for Phase 3 ---

class CrowdDensityPrediction(BaseModel):
    sector_id: str
    current_density: int
    predicted_density_15m: int
    threshold: int
    status: str

class AnomalyReport(BaseModel):
    id: str
    type: str
    confidence: float
    description: str


@router.get("/analytics/crowd-density", response_model=list[CrowdDensityPrediction])
async def get_crowd_density(user: CommandOrHigher) -> list[CrowdDensityPrediction]:
    """
    Get predictive crowd density analytics for Command Center layout.
    """
    # Mock data representing ML model outputs for Nashik sectors
    return [
        CrowdDensityPrediction(
            sector_id="SECTOR_NORTH_GHAT",
            current_density=4500,
            predicted_density_15m=5200,
            threshold=5000,
            status="WARNING"
        ),
        CrowdDensityPrediction(
            sector_id="SECTOR_SOUTH_GHAT",
            current_density=2100,
            predicted_density_15m=2000,
            threshold=5000,
            status="NORMAL"
        )
    ]


@router.post("/analytics/anomaly", response_model=AnomalyReport)
async def trigger_anomaly_detection(user: CommandOrHigher) -> AnomalyReport:
    """
    Trigger a manual anomaly sweep using the underlying ML pipeline.
    """
    return AnomalyReport(
        id="ANOMALY-8891",
        type="SURGE_DETECTED",
        confidence=0.89,
        description="Abnormal unidirectional movement detected near North Entrance."
    )
