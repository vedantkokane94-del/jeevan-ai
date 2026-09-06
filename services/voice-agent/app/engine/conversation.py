"""
JEEVAN AI — Conversation State Machine Engine

Manages the complete lifecycle of an emergency voice call using
a finite state machine. Each state produces a TTS prompt and
defines transitions based on NLU analysis of caller input.
"""

import logging
import time
import uuid
from dataclasses import dataclass, field
from enum import Enum
from typing import Any

from app.engine.language_detector import detect_language, LanguageDetectionResult
from app.engine.nlu import NLUResult, nlu_engine
from app.intelligence.emergency_types import get_emergency_type, get_incident_title
from app.intelligence.first_aid import get_first_aid_protocol, FirstAidProtocol
from app.intelligence.landmarks import landmark_resolver, LandmarkMatch

logger = logging.getLogger(__name__)


class CallState(str, Enum):
    """States in the emergency call conversation."""
    GREETING = "GREETING"
    CONSENT = "CONSENT"
    LANGUAGE_DETECT = "LANGUAGE_DETECT"
    LISTEN_EMERGENCY = "LISTEN_EMERGENCY"
    ASK_LOCATION = "ASK_LOCATION"
    ASK_DETAILS = "ASK_DETAILS"
    PROVIDE_GUIDANCE = "PROVIDE_GUIDANCE"
    TICKET_CREATED = "TICKET_CREATED"
    AWAITING_HELP = "AWAITING_HELP"
    CALL_END = "CALL_END"


@dataclass
class ConversationContext:
    """Maintains the full context of an ongoing call."""
    session_id: str = ""
    state: CallState = CallState.GREETING
    language: str = "hi"
    language_confidence: float = 0.0
    caller_consent: bool = False

    # Emergency details
    emergency_type: str = ""
    emergency_severity: str = ""
    nlu_result: NLUResult | None = None

    # Location
    landmark: LandmarkMatch | None = None
    zone_id: str = ""
    latitude: float = 0.0
    longitude: float = 0.0

    # First aid
    first_aid_protocol: FirstAidProtocol | None = None
    first_aid_step_index: int = 0

    # Ticket
    incident_id: str = ""
    ticket_created: bool = False

    # Conversation history
    turns: list[dict[str, Any]] = field(default_factory=list)
    started_at: float = field(default_factory=time.time)
    silence_count: int = 0

    def add_turn(self, role: str, content: str, intent: str = "", confidence: float = 0.0):
        self.turns.append({
            "turn": len(self.turns) + 1,
            "role": role,
            "content": content,
            "intent": intent,
            "confidence": confidence,
            "timestamp": time.time(),
        })

    def duration_seconds(self) -> float:
        return time.time() - self.started_at


@dataclass
class ConversationResponse:
    """Output from the conversation engine for a single turn."""
    text: str
    language: str
    state: CallState
    should_create_ticket: bool = False
    ticket_data: dict[str, Any] | None = None
    is_final: bool = False
    metadata: dict[str, Any] = field(default_factory=dict)


class ConversationEngine:
    """
    Finite State Machine that drives emergency call conversations.

    Flow: GREETING → CONSENT → LISTEN_EMERGENCY → ASK_LOCATION →
          ASK_DETAILS → PROVIDE_GUIDANCE → TICKET_CREATED → AWAITING_HELP
    """

    def __init__(self):
        self._active_sessions: dict[str, ConversationContext] = {}

    def create_session(self) -> ConversationContext:
        ctx = ConversationContext(
            session_id=f"call_{uuid.uuid4().hex[:12]}"
        )
        self._active_sessions[ctx.session_id] = ctx
        logger.info(f"Session created: {ctx.session_id}")
        return ctx

    def get_session(self, session_id: str) -> ConversationContext | None:
        return self._active_sessions.get(session_id)

    def end_session(self, session_id: str) -> None:
        if session_id in self._active_sessions:
            del self._active_sessions[session_id]
            logger.info(f"Session ended: {session_id}")

    @property
    def active_call_count(self) -> int:
        return len(self._active_sessions)

    def get_greeting(self, ctx: ConversationContext) -> ConversationResponse:
        """Generate the initial greeting and move to CONSENT state."""
        greetings = {
            "hi": ("नमस्कार! जीवन AI आपातकालीन सहायता में आपका स्वागत है। "
                   "मैं आपकी मदद के लिए यहाँ हूँ।"),
            "mr": ("नमस्कार! जीवन AI आणीबाणी सहायता मध्ये आपले स्वागत आहे. "
                   "मी तुमच्या मदतीसाठी येथे आहे."),
            "en": ("Namaskar! Welcome to JEEVAN AI Emergency Helpline. "
                   "I am here to help you."),
        }
        text = greetings.get(ctx.language, greetings["hi"])
        ctx.state = CallState.CONSENT
        ctx.add_turn("agent", text)

        return ConversationResponse(text=text, language=ctx.language, state=ctx.state)

    def get_consent_prompt(self, ctx: ConversationContext) -> ConversationResponse:
        """Ask for recording consent."""
        prompts = {
            "hi": "यह कॉल आपकी सुरक्षा के लिए रिकॉर्ड की जा रही है। कृपया अपनी समस्या बताएं।",
            "mr": "ही कॉल तुमच्या सुरक्षिततेसाठी रेकॉर्ड केली जात आहे. कृपया तुमची समस्या सांगा.",
            "en": "This call is recorded for your safety. Please describe your emergency.",
        }
        text = prompts.get(ctx.language, prompts["hi"])
        ctx.state = CallState.LISTEN_EMERGENCY
        ctx.caller_consent = True
        ctx.add_turn("agent", text)

        return ConversationResponse(text=text, language=ctx.language, state=ctx.state)

    def process_input(self, ctx: ConversationContext, text: str) -> ConversationResponse:
        """
        Process caller input based on current conversation state.

        This is the main state machine transition function.
        """
        if not text or not text.strip():
            ctx.silence_count += 1
            if ctx.silence_count >= 3:
                return self._silence_escalation(ctx)
            return self._silence_reprompt(ctx)

        ctx.silence_count = 0
        ctx.add_turn("caller", text)

        # Detect language from input
        lang_result = detect_language(text)
        if lang_result.confidence > ctx.language_confidence:
            ctx.language = lang_result.primary_language
            ctx.language_confidence = lang_result.confidence

        # Route to state handler
        handlers = {
            CallState.LISTEN_EMERGENCY: self._handle_emergency_input,
            CallState.ASK_LOCATION: self._handle_location_input,
            CallState.ASK_DETAILS: self._handle_details_input,
            CallState.PROVIDE_GUIDANCE: self._handle_guidance_input,
            CallState.AWAITING_HELP: self._handle_awaiting_input,
        }

        handler = handlers.get(ctx.state, self._handle_fallback)
        return handler(ctx, text)

    # ═══════════════════════════════════════════════
    # STATE HANDLERS
    # ═══════════════════════════════════════════════

    def _handle_emergency_input(self, ctx: ConversationContext, text: str) -> ConversationResponse:
        """Handle the initial emergency description."""
        # Run NLU analysis
        nlu_result = nlu_engine.analyze(text)
        ctx.nlu_result = nlu_result
        ctx.emergency_type = nlu_result.intent.name
        ctx.emergency_severity = nlu_result.intent.severity

        # Try to detect landmark from the text
        landmark_match = landmark_resolver.resolve(text)
        if landmark_match:
            ctx.landmark = landmark_match
            ctx.zone_id = landmark_match.landmark.zone_id
            ctx.latitude = landmark_match.landmark.latitude
            ctx.longitude = landmark_match.landmark.longitude

        if nlu_result.intent.name == "UNKNOWN" or nlu_result.intent.confidence < 0.2:
            prompts = {
                "hi": "मुझे समझ नहीं आया। क्या कोई घायल है? क्या कोई खतरे में है? कृपया बताएं।",
                "mr": "मला समजले नाही. कोणी जखमी आहे का? कोणी धोक्यात आहे का? कृपया सांगा.",
                "en": "I didn't understand. Is someone injured? Is someone in danger? Please tell me.",
            }
            text_out = prompts.get(ctx.language, prompts["hi"])
            ctx.add_turn("agent", text_out)
            return ConversationResponse(text=text_out, language=ctx.language, state=ctx.state)

        # Emergency detected — acknowledge and ask for location if not found
        emergency_type_info = get_emergency_type(ctx.emergency_type)

        if ctx.landmark:
            # We have location, skip to details
            ctx.state = CallState.ASK_DETAILS
            ack = {
                "hi": f"मुझे समझ आ गया। {emergency_type_info.name_hi} — {ctx.landmark.landmark.name_hi} के पास। ",
                "mr": f"मला समजले. {emergency_type_info.name_mr} — {ctx.landmark.landmark.name_mr} जवळ. ",
                "en": f"I understand. {emergency_type_info.name_en} near {ctx.landmark.landmark.name_en}. ",
            }
            followup = {
                "hi": "क्या वे होश में हैं? कितने लोग प्रभावित हैं?",
                "mr": "ते शुद्धीवर आहेत का? किती लोक प्रभावित आहेत?",
                "en": "Are they conscious? How many people are affected?",
            }
            text_out = ack.get(ctx.language, ack["hi"]) + followup.get(ctx.language, followup["hi"])
        else:
            # Need location
            ctx.state = CallState.ASK_LOCATION
            ack = {
                "hi": f"मुझे समझ आ गया — {emergency_type_info.name_hi}। ",
                "mr": f"मला समजले — {emergency_type_info.name_mr}. ",
                "en": f"I understand — {emergency_type_info.name_en}. ",
            }
            loc_q = {
                "hi": "आप कहाँ हैं? कोई मंदिर, घाट या जगह का नाम बताएं।",
                "mr": "तुम्ही कुठे आहात? कोणते मंदिर, घाट किंवा जागेचे नाव सांगा.",
                "en": "Where are you? Tell me the nearest temple, ghat, or landmark name.",
            }
            text_out = ack.get(ctx.language, ack["hi"]) + loc_q.get(ctx.language, loc_q["hi"])

        ctx.add_turn("agent", text_out)
        return ConversationResponse(text=text_out, language=ctx.language, state=ctx.state)

    def _handle_location_input(self, ctx: ConversationContext, text: str) -> ConversationResponse:
        """Handle location input after emergency is classified."""
        landmark_match = landmark_resolver.resolve(text)

        if landmark_match:
            ctx.landmark = landmark_match
            ctx.zone_id = landmark_match.landmark.zone_id
            ctx.latitude = landmark_match.landmark.latitude
            ctx.longitude = landmark_match.landmark.longitude

            ctx.state = CallState.ASK_DETAILS
            confirm = {
                "hi": f"ठीक है, {landmark_match.landmark.name_hi} के पास। क्या वे होश में हैं?",
                "mr": f"ठीक आहे, {landmark_match.landmark.name_mr} जवळ. ते शुद्धीवर आहेत का?",
                "en": f"OK, near {landmark_match.landmark.name_en}. Are they conscious?",
            }
            text_out = confirm.get(ctx.language, confirm["hi"])
        else:
            retry = {
                "hi": "मुझे जगह समझ नहीं आई। रामकुंड, पंचवटी, काळाराम जैसा कोई नाम बताएं।",
                "mr": "मला जागा समजली नाही. रामकुंड, पंचवटी, काळाराम असे कोणते नाव सांगा.",
                "en": "I didn't catch the location. Please say a landmark like Ramkund, Panchavati, or Kalaram.",
            }
            text_out = retry.get(ctx.language, retry["hi"])

        ctx.add_turn("agent", text_out)
        return ConversationResponse(text=text_out, language=ctx.language, state=ctx.state)

    def _handle_details_input(self, ctx: ConversationContext, text: str) -> ConversationResponse:
        """Handle additional details and begin first-aid + ticket creation."""
        # Get first-aid protocol
        ctx.first_aid_protocol = get_first_aid_protocol(ctx.emergency_type)
        ctx.first_aid_step_index = 0
        ctx.state = CallState.PROVIDE_GUIDANCE

        # Create ticket
        emergency_info = get_emergency_type(ctx.emergency_type)
        ticket_data = {
            "title": get_incident_title(emergency_info, ctx.language),
            "description": ctx.nlu_result.emergency_summary if ctx.nlu_result else "",
            "severity": ctx.emergency_severity,
            "emergency_type": ctx.emergency_type,
            "location": {"latitude": ctx.latitude, "longitude": ctx.longitude},
            "zone_id": ctx.zone_id,
            "landmark": ctx.landmark.landmark.name_en if ctx.landmark else "",
            "language": ctx.language,
            "caller_details": text,
            "session_id": ctx.session_id,
        }

        # Get first guidance step
        guidance = ctx.first_aid_protocol.get_step(0, ctx.language)
        preamble = {
            "hi": "मदद भेजी जा रही है। तब तक ये करें — ",
            "mr": "मदत पाठवली जात आहे. तोपर्यंत हे करा — ",
            "en": "Help is being dispatched. Meanwhile, do this — ",
        }
        text_out = preamble.get(ctx.language, preamble["hi"]) + (guidance or "")

        ctx.add_turn("agent", text_out)
        return ConversationResponse(
            text=text_out,
            language=ctx.language,
            state=ctx.state,
            should_create_ticket=True,
            ticket_data=ticket_data
        )

    def _handle_guidance_input(self, ctx: ConversationContext, text: str) -> ConversationResponse:
        """Provide next first-aid step after caller confirmation."""
        if not ctx.first_aid_protocol:
            ctx.state = CallState.AWAITING_HELP
            return self._awaiting_help_message(ctx)

        ctx.first_aid_step_index += 1
        guidance = ctx.first_aid_protocol.get_step(ctx.first_aid_step_index, ctx.language)

        if guidance:
            text_out = guidance
            ctx.add_turn("agent", text_out)
            return ConversationResponse(text=text_out, language=ctx.language, state=ctx.state)
        else:
            ctx.state = CallState.AWAITING_HELP
            return self._awaiting_help_message(ctx)

    def _handle_awaiting_input(self, ctx: ConversationContext, text: str) -> ConversationResponse:
        """Keep caller engaged while help arrives."""
        reassurance = {
            "hi": "मदद रास्ते में है। शांत रहें। मैं आपके साथ हूँ। क्या और कुछ बताना है?",
            "mr": "मदत वाटेवर आहे. शांत राहा. मी तुमच्यासोबत आहे. अजून काही सांगायचे आहे का?",
            "en": "Help is on the way. Stay calm. I am with you. Anything else to report?",
        }
        text_out = reassurance.get(ctx.language, reassurance["hi"])
        ctx.add_turn("agent", text_out)
        return ConversationResponse(text=text_out, language=ctx.language, state=ctx.state)

    def _handle_fallback(self, ctx: ConversationContext, text: str) -> ConversationResponse:
        """Fallback for unexpected states."""
        fallback = {
            "hi": "कृपया अपनी समस्या बताएं। मैं आपकी मदद करना चाहता हूँ।",
            "mr": "कृपया तुमची समस्या सांगा. मी तुम्हाला मदत करू इच्छितो.",
            "en": "Please describe your problem. I want to help you.",
        }
        text_out = fallback.get(ctx.language, fallback["hi"])
        ctx.state = CallState.LISTEN_EMERGENCY
        ctx.add_turn("agent", text_out)
        return ConversationResponse(text=text_out, language=ctx.language, state=ctx.state)

    # ═══════════════════════════════════════════════
    # HELPERS
    # ═══════════════════════════════════════════════

    def _silence_reprompt(self, ctx: ConversationContext) -> ConversationResponse:
        prompts = {
            "hi": "क्या आप वहाँ हैं? कृपया बोलें। मैं आपकी मदद के लिए हूँ।",
            "mr": "तुम्ही तिथे आहात का? कृपया बोला. मी तुमच्या मदतीसाठी आहे.",
            "en": "Are you there? Please speak. I am here to help you.",
        }
        text_out = prompts.get(ctx.language, prompts["hi"])
        ctx.add_turn("agent", text_out)
        return ConversationResponse(text=text_out, language=ctx.language, state=ctx.state)

    def _silence_escalation(self, ctx: ConversationContext) -> ConversationResponse:
        escalation = {
            "hi": "कोई जवाब नहीं मिल रहा। सुरक्षा के लिए आपके स्थान पर मदद भेजी जा रही है।",
            "mr": "कोणताही प्रतिसाद नाही. सुरक्षिततेसाठी तुमच्या ठिकाणी मदत पाठवली जात आहे.",
            "en": "No response received. For safety, dispatching help to your location.",
        }
        text_out = escalation.get(ctx.language, escalation["hi"])
        ctx.state = CallState.TICKET_CREATED
        ctx.add_turn("agent", text_out)

        ticket_data = {
            "title": f"[VOICE SOS] Silent Call — Possible Emergency",
            "description": "Caller became unresponsive after initial contact",
            "severity": "HIGH",
            "emergency_type": ctx.emergency_type or "UNKNOWN",
            "session_id": ctx.session_id,
            "location": {"latitude": ctx.latitude, "longitude": ctx.longitude},
        }

        return ConversationResponse(
            text=text_out, language=ctx.language, state=ctx.state,
            should_create_ticket=True, ticket_data=ticket_data
        )

    def _awaiting_help_message(self, ctx: ConversationContext) -> ConversationResponse:
        msgs = {
            "hi": "सभी प्राथमिक चिकित्सा निर्देश दे दिए हैं। मदद जल्द पहुँचेगी। मैं आपके साथ हूँ।",
            "mr": "सर्व प्रथमोपचार सूचना दिल्या आहेत. मदत लवकरच पोहोचेल. मी तुमच्यासोबत आहे.",
            "en": "All first-aid instructions given. Help arriving soon. I am with you.",
        }
        text_out = msgs.get(ctx.language, msgs["hi"])
        ctx.add_turn("agent", text_out)
        return ConversationResponse(text=text_out, language=ctx.language, state=ctx.state)


# Global singleton
conversation_engine = ConversationEngine()
