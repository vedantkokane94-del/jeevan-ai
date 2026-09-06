"""
JEEVAN AI — Incident API Endpoints
"""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from geoalchemy2.shape import to_shape
from sqlalchemy import select

from app.api.dependencies import CurrentUser, SessionDep, require_role
from app.models.incident import Incident
from app.schemas.incident import IncidentCreate, IncidentRead, IncidentUpdate, Location

router = APIRouter(tags=["incidents"])

# Only Responders, Command, and Admins can manage incidents globally
ResponderOrHigher = Annotated[
    CurrentUser, Depends(require_role(["RESPONDER", "COMMAND", "ADMIN"]))
]


def format_incident(incident: Incident) -> IncidentRead:
    """Helper to format the SQLAlchemy model to a Pydantic Read schema with parsed geometry."""
    # Convert WKBElement to Shapely geometry to extract coords
    point = to_shape(incident.location)

    return IncidentRead(
        id=incident.id,
        title=incident.title,
        description=incident.description,
        severity=incident.severity,
        status=incident.status,
        location=Location(longitude=point.x, latitude=point.y),
        reported_by_id=incident.reported_by_id,
        assigned_to_id=incident.assigned_to_id,
        created_at=incident.created_at,
        updated_at=incident.updated_at
    )


@router.get("/incidents", response_model=list[IncidentRead])
async def list_incidents(
    session: SessionDep,
    user: ResponderOrHigher
) -> list[IncidentRead]:
    """Get all incidents (Responder, Command, Admin access)."""
    stmt = select(Incident).order_by(Incident.created_at.desc())
    result = await session.execute(stmt)
    incidents = result.scalars().all()

    return [format_incident(inc) for inc in incidents]


@router.post("/incidents", response_model=IncidentRead, status_code=status.HTTP_201_CREATED)
async def create_incident(
    data: IncidentCreate,
    session: SessionDep,
    current_user: CurrentUser
) -> IncidentRead:
    """Report a new incident. Anyone authenticated can report."""
    # Convert Location into WKT (Well-Known Text) for PostGIS
    wkt_location = f"SRID=4326;POINT({data.location.longitude} {data.location.latitude})"

    incident = Incident(
        title=data.title,
        description=data.description,
        severity=data.severity,
        status=data.status,
        location=wkt_location,
        reported_by_id=current_user.id
    )

    session.add(incident)
    await session.commit()
    await session.refresh(incident)

    return format_incident(incident)


@router.patch("/incidents/{incident_id}", response_model=IncidentRead)
async def update_incident(
    incident_id: UUID,
    data: IncidentUpdate,
    session: SessionDep,
    user: ResponderOrHigher
) -> IncidentRead:
    """Update incident status or assignee (e.g., Responder accepts dispatch)."""
    stmt = select(Incident).where(Incident.id == incident_id)
    result = await session.execute(stmt)
    incident = result.scalar_one_or_none()

    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    if data.status is not None:
        incident.status = data.status

    if data.assigned_to_id is not None:
        incident.assigned_to_id = data.assigned_to_id

    await session.commit()
    await session.refresh(incident)

    return format_incident(incident)
