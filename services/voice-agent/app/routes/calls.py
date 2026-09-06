"""
JEEVAN AI — Voice Call REST API Routes

Provides endpoints for call history, active calls,
and voice analytics for the Command Center dashboard.
"""

from fastapi import APIRouter

from app.engine.conversation import conversation_engine
from app.telephony.call_manager import call_manager
from app.schemas.call import ActiveCallInfo, VoiceAnalytics

router = APIRouter(prefix="/calls", tags=["calls"])


@router.get("/active")
async def get_active_calls():
    """Get all currently active voice calls."""
    calls = await call_manager.get_active_calls()
    return {
        "active_calls": calls,
        "count": len(calls),
    }


@router.get("/analytics")
async def get_voice_analytics():
    """Get voice call analytics for the dashboard."""
    # For MVP, return mock analytics based on active sessions
    active = conversation_engine.active_call_count

    return VoiceAnalytics(
        total_calls=active + 47,  # Simulated historical
        active_calls=active,
        completed_calls=47,
        avg_duration_seconds=186.5,
        calls_by_language={"hi": 28, "mr": 15, "en": 4},
        calls_by_emergency_type={
            "MEDICAL_EMERGENCY": 18,
            "HEATSTROKE": 12,
            "MISSING_PERSON": 8,
            "CROWD_CRUSH": 4,
            "DROWNING": 3,
            "FIRE": 1,
            "GENERAL_HELP": 1,
        },
        calls_by_zone={
            "ZONE_A_CENTRAL": 22,
            "ZONE_B_NORTH": 10,
            "ZONE_D_TRIMBAK": 8,
            "ZONE_C_OUTER": 4,
            "ZONE_F_TRANSIT": 3,
        },
        tickets_created=42,
    )


@router.get("/recent")
async def get_recent_calls():
    """Get recent completed call logs (simulated for MVP)."""
    return {
        "calls": [
            {
                "session_id": "vc_demo_001",
                "language": "hi",
                "status": "COMPLETED",
                "emergency_type": "MEDICAL_EMERGENCY",
                "severity": "CRITICAL",
                "landmark": "Ramkund",
                "zone": "ZONE_A_CENTRAL",
                "duration_seconds": 245,
                "turn_count": 8,
                "ticket_id": "VT-demo001",
                "started_at": "2027-01-15T14:23:00Z",
            },
            {
                "session_id": "vc_demo_002",
                "language": "mr",
                "status": "COMPLETED",
                "emergency_type": "HEATSTROKE",
                "severity": "HIGH",
                "landmark": "Panchavati",
                "zone": "ZONE_B_NORTH",
                "duration_seconds": 180,
                "turn_count": 6,
                "ticket_id": "VT-demo002",
                "started_at": "2027-01-15T13:45:00Z",
            },
            {
                "session_id": "vc_demo_003",
                "language": "hi",
                "status": "COMPLETED",
                "emergency_type": "MISSING_PERSON",
                "severity": "HIGH",
                "landmark": "Kalaram Temple",
                "zone": "ZONE_B_NORTH",
                "duration_seconds": 312,
                "turn_count": 10,
                "ticket_id": "VT-demo003",
                "started_at": "2027-01-15T12:10:00Z",
            },
            {
                "session_id": "vc_demo_004",
                "language": "mr",
                "status": "COMPLETED",
                "emergency_type": "CROWD_CRUSH",
                "severity": "CRITICAL",
                "landmark": "Godavari Ghats",
                "zone": "ZONE_A_CENTRAL",
                "duration_seconds": 156,
                "turn_count": 5,
                "ticket_id": "VT-demo004",
                "started_at": "2027-01-15T11:30:00Z",
            },
            {
                "session_id": "vc_demo_005",
                "language": "hi",
                "status": "DROPPED",
                "emergency_type": "DROWNING",
                "severity": "CRITICAL",
                "landmark": "Kushavarta Kund",
                "zone": "ZONE_D_TRIMBAK",
                "duration_seconds": 67,
                "turn_count": 3,
                "ticket_id": "VT-demo005",
                "started_at": "2027-01-15T10:55:00Z",
            },
        ]
    }
