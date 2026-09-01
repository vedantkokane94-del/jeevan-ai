"""
JEEVAN AI — Hospital API Endpoints
"""


from fastapi import APIRouter, Query
from geoalchemy2.functions import ST_Distance, ST_DWithin
from sqlalchemy import select

from app.api.dependencies import CurrentUser, SessionDep
from app.models.hospital import Hospital
from app.schemas.hospital import HospitalResponse

router = APIRouter(tags=["hospitals"])


@router.get("/hospitals/nearby", response_model=list[HospitalResponse])
async def get_nearby_hospitals(
    session: SessionDep,
    user: CurrentUser,
    lat: float = Query(..., description="User latitude", ge=-90, le=90),
    lng: float = Query(..., description="User longitude", ge=-180, le=180),
    radius_km: float = Query(10.0, description="Search radius in kilometers"),
    require_icu: bool = Query(False, description="Filter by ICU availability"),
    require_blood: bool = Query(False, description="Filter by Blood Bank availability")
) -> list[HospitalResponse]:
    """Find nearby hospitals using PostGIS spatial queries."""

    # Convert lat/lng to PostGIS geography point
    user_location = f"SRID=4326;POINT({lng} {lat})"

    # Base query: ST_DWithin for efficient radius search (distance in meters)
    stmt = select(
        Hospital,
        ST_Distance(Hospital.location, user_location).label("distance_meters")
    ).where(
        ST_DWithin(Hospital.location, user_location, radius_km * 1000)
    )

    # Apply filters
    if require_icu:
        stmt = stmt.where(Hospital.has_icu, Hospital.available_icu > 0)
    if require_blood:
        stmt = stmt.where(Hospital.has_blood_bank)

    # Order by nearest
    stmt = stmt.order_by("distance_meters")

    result = await session.execute(stmt)
    rows = result.all()

    hospitals = []
    for row in rows:
        hospital_obj = row.Hospital
        distance_meters = row.distance_meters

        # We need to extract lat/long from the WKBElement
        # A simple hack for now is to just return a dummy if we don't parse WKB here
        # But we'll parse it using geoalchemy2's shape if we wanted.
        # Since we just want it to work with schemas:
        from geoalchemy2.shape import to_shape
        point = to_shape(hospital_obj.location)

        hospitals.append(
            HospitalResponse(
                id=hospital_obj.id,
                name=hospital_obj.name,
                address=hospital_obj.address,
                phone_number=hospital_obj.phone_number,
                has_emergency=hospital_obj.has_emergency,
                has_icu=hospital_obj.has_icu,
                has_blood_bank=hospital_obj.has_blood_bank,
                specialties=hospital_obj.specialties,
                total_beds=hospital_obj.total_beds,
                available_beds=hospital_obj.available_beds,
                total_icu=hospital_obj.total_icu,
                available_icu=hospital_obj.available_icu,
                blood_stock_units=hospital_obj.blood_stock_units,
                latitude=point.y,
                longitude=point.x,
                distance_km=round(distance_meters / 1000, 2) if distance_meters else None,
                last_updated=hospital_obj.last_updated,
                created_at=hospital_obj.created_at
            )
        )

    return hospitals
