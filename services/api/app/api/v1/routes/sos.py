"""
JEEVAN AI — Critical SOS API Endpoint
"""


from fastapi import APIRouter, BackgroundTasks, status
from geoalchemy2.functions import ST_Distance, ST_DWithin
from sqlalchemy import select

from app.api.dependencies import CurrentUser, SessionDep
from app.core.pubsub import pubsub_manager
from app.models.ambulance import Ambulance
from app.models.incident import Incident
from app.schemas.incident import IncidentCreate, IncidentRead

router = APIRouter(tags=["sos"])


async def notify_family_background(user_id: str, incident_id: str):
    """Background task to simulate pushing notifications to family circle."""
    print(f"[SOS Workflow] Alerting family for user {user_id} regarding incident {incident_id}")
    # In reality, this would fetch family members from DB and send push/SMS


@router.post("/sos", response_model=IncidentRead, status_code=status.HTTP_201_CREATED)
async def trigger_emergency_sos(
    data: IncidentCreate,
    session: SessionDep,
    current_user: CurrentUser,
    background_tasks: BackgroundTasks
) -> IncidentRead:
    """
    Module 1: One-Tap Emergency SOS
    1. Creates the incident
    2. Uses PostGIS to find the nearest available ambulance
    3. Assigns the ambulance
    4. Triggers background family notification
    5. Broadcasts via WebSocket to Command Center
    """

    wkt_location = f"SRID=4326;POINT({data.location.longitude} {data.location.latitude})"

    # 1. Create Incident
    incident = Incident(
        title=data.title,
        description=data.description,
        severity=data.severity,
        status="NEW",
        location=wkt_location,
        reported_by_id=current_user.id
    )
    session.add(incident)
    await session.commit()
    await session.refresh(incident)

    # 2. Find nearest available ambulance (within 10km)
    stmt = select(
        Ambulance,
        ST_Distance(Ambulance.current_location, wkt_location).label("distance")
    ).where(
        Ambulance.status == "AVAILABLE",
        ST_DWithin(Ambulance.current_location, wkt_location, 10000)
    ).order_by("distance").limit(1)

    result = await session.execute(stmt)
    nearest_ambulance = result.scalar_one_or_none()

    # 3. Assign if found
    if nearest_ambulance:
        nearest_ambulance.status = "DISPATCHED"
        nearest_ambulance.current_incident_id = incident.id
        incident.status = "DISPATCHED"
        await session.commit()
        await session.refresh(incident)
        print(
            f"[SOS Workflow] Assigned Ambulance {nearest_ambulance.vehicle_number} "
            f"to Incident {incident.id}"
        )

    # 4. Background tasks (Family + AI Prediction engine hooks)
    background_tasks.add_task(notify_family_background, str(current_user.id), str(incident.id))

    # 5. Broadcast to Command Center via Redis Pub/Sub
    from app.api.v1.routes.incidents import format_incident
    read_schema = format_incident(incident)
    await pubsub_manager.publish("incidents:live", read_schema.model_dump_json())

    return read_schema
