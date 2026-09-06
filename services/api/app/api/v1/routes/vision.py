import asyncio
import random

from fastapi import APIRouter, File, UploadFile
from pydantic import BaseModel

router = APIRouter(prefix="/vision", tags=["Vision AI"])

class CrowdAnalysisRequest(BaseModel):
    zone_id: str
    camera_id: str

class CrowdAnalysisResponse(BaseModel):
    density_percentage: int
    estimated_count: int
    risk_level: str
    yolo_confidence: float

@router.post("/analyze-crowd", response_model=CrowdAnalysisResponse)
async def analyze_crowd_feed(request: CrowdAnalysisRequest):
    """
    Mock endpoint simulating a YOLOv8 or DeepSORT computer vision pass on an RTSP camera frame.
    In a true production setting, this would farm out to a GPU microservice (like Triton).
    """
    # Simulate processing delay
    await asyncio.sleep(0.5)

    density = random.randint(30, 95)
    count = int((density / 100) * 15000) # Mock base capacity

    if density > 85:
        risk = "CRITICAL"
    elif density > 65:
        risk = "HIGH"
    elif density > 40:
        risk = "MEDIUM"
    else:
        risk = "LOW"

    return CrowdAnalysisResponse(
        density_percentage=density,
        estimated_count=count,
        risk_level=risk,
        yolo_confidence=round(random.uniform(0.85, 0.98), 2)
    )

class FaceMatchResponse(BaseModel):
    match_found: bool
    confidence: float
    matched_person_id: str | None = None
    last_seen_zone: str | None = None

@router.post("/recognize-face", response_model=FaceMatchResponse)
async def recognize_face(file: UploadFile = File(...)):  # noqa: B008
    """
    Mock endpoint simulating a facial recognition pipeline.
    In production, this uploads the image to AWS Rekognition or uses
    the `face_recognition` library against a Postgres vector DB.
    """
    # Simulate extraction and matching delay
    await asyncio.sleep(1.2)

    # 30% chance of finding a match for demo purposes
    is_match = random.random() > 0.7

    if is_match:
        return FaceMatchResponse(
            match_found=True,
            confidence=round(random.uniform(0.90, 0.99), 2),
            matched_person_id=f"LP-{random.randint(1000,9999)}",
            last_seen_zone="Sector 4 (Ramkund)"
        )
    else:
        return FaceMatchResponse(
            match_found=False,
            confidence=0.0
        )
