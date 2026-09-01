"""
JEEVAN AI — Ambulance API Endpoints
"""

from typing import Annotated

from fastapi import APIRouter, Depends
from geoalchemy2.shape import to_shape
from sqlalchemy import select

from app.api.dependencies import CurrentUser, SessionDep, require_role
from app.models.ambulance import Ambulance
from app.schemas.ambulance import AmbulanceResponse

router = APIRouter(tags=["ambulances"])

CommandOrHigher = Annotated[
    CurrentUser, Depends(require_role(["COMMAND", "ADMIN"]))
]


@router.get("/ambulances/live", response_model=list[AmbulanceResponse])
async def get_live_ambulances(
    session: SessionDep,
    user: CommandOrHigher
) -> list[AmbulanceResponse]:
    """Get real-time tracking data for all active ambulances."""

    # In a real app, this might query Redis for ultra-low latency,
    # but querying the DB is fine if last_ping is updated frequently.
    stmt = select(Ambulance).where(Ambulance.status != "OFFLINE")
    result = await session.execute(stmt)
    ambulances = result.scalars().all()

    response = []
    for amb in ambulances:
        lat, lng = None, None
        if amb.current_location is not None:
            point = to_shape(amb.current_location)
            lat, lng = point.y, point.x

        response.append(
            AmbulanceResponse(
                id=amb.id,
                vehicle_number=amb.vehicle_number,
                driver_id=amb.driver_id,
                status=amb.status,
                current_speed_kmh=amb.current_speed_kmh,
                current_incident_id=amb.current_incident_id,
                latitude=lat,
                longitude=lng,
                last_ping=amb.last_ping
            )
        )

    return response
