"""
JEEVAN AI — Emergency Type Classification

Defines emergency categories specific to Kumbh Mela scenarios
with severity levels and response protocols.
"""

from dataclasses import dataclass


@dataclass
class EmergencyType:
    id: str
    name_en: str
    name_hi: str
    name_mr: str
    severity: str
    response_time_target_min: int
    requires_ambulance: bool
    requires_police: bool
    color_code: str


EMERGENCY_TYPES: dict[str, EmergencyType] = {
    "MEDICAL_EMERGENCY": EmergencyType(
        id="MEDICAL_EMERGENCY", name_en="Medical Emergency",
        name_hi="चिकित्सा आपातकाल", name_mr="वैद्यकीय आणीबाणी",
        severity="CRITICAL", response_time_target_min=4,
        requires_ambulance=True, requires_police=False, color_code="#EF4444"
    ),
    "HEATSTROKE": EmergencyType(
        id="HEATSTROKE", name_en="Heatstroke / Dehydration",
        name_hi="लू लगना", name_mr="उष्माघात",
        severity="HIGH", response_time_target_min=6,
        requires_ambulance=True, requires_police=False, color_code="#F97316"
    ),
    "DROWNING": EmergencyType(
        id="DROWNING", name_en="Drowning / Water Emergency",
        name_hi="डूबना", name_mr="बुडणे",
        severity="CRITICAL", response_time_target_min=2,
        requires_ambulance=True, requires_police=True, color_code="#DC2626"
    ),
    "CROWD_CRUSH": EmergencyType(
        id="CROWD_CRUSH", name_en="Crowd Crush / Stampede",
        name_hi="भगदड़", name_mr="चेंगराचेंगरी",
        severity="CRITICAL", response_time_target_min=3,
        requires_ambulance=True, requires_police=True, color_code="#B91C1C"
    ),
    "FIRE": EmergencyType(
        id="FIRE", name_en="Fire Emergency",
        name_hi="आग की घटना", name_mr="आग लागणे",
        severity="CRITICAL", response_time_target_min=3,
        requires_ambulance=True, requires_police=True, color_code="#991B1B"
    ),
    "MISSING_PERSON": EmergencyType(
        id="MISSING_PERSON", name_en="Missing Person",
        name_hi="लापता व्यक्ति", name_mr="बेपत्ता व्यक्ती",
        severity="HIGH", response_time_target_min=10,
        requires_ambulance=False, requires_police=True, color_code="#D97706"
    ),
    "GENERAL_HELP": EmergencyType(
        id="GENERAL_HELP", name_en="General Assistance",
        name_hi="सामान्य सहायता", name_mr="सामान्य मदत",
        severity="MEDIUM", response_time_target_min=15,
        requires_ambulance=False, requires_police=False, color_code="#2563EB"
    ),
}


def get_emergency_type(intent_name: str) -> EmergencyType:
    return EMERGENCY_TYPES.get(intent_name, EMERGENCY_TYPES["GENERAL_HELP"])


def get_incident_title(emergency_type: EmergencyType, language: str = "en") -> str:
    names = {"en": emergency_type.name_en, "hi": emergency_type.name_hi, "mr": emergency_type.name_mr}
    return f"[VOICE SOS] {names.get(language, emergency_type.name_en)}"
