"""
JEEVAN AI — First Aid Guidance Module

Provides step-by-step voice guidance for Kumbh Mela emergencies
in Hindi and Marathi. Each protocol is designed for progressive
disclosure — one instruction at a time, waiting for caller confirmation.
"""

import logging
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)


@dataclass
class FirstAidStep:
    text_hi: str
    text_mr: str
    text_en: str
    requires_confirmation: bool = True


@dataclass
class FirstAidProtocol:
    emergency_type: str
    steps: list[FirstAidStep] = field(default_factory=list)

    def get_step(self, index: int, language: str = "hi") -> str | None:
        if index >= len(self.steps):
            return None
        step = self.steps[index]
        texts = {"hi": step.text_hi, "mr": step.text_mr, "en": step.text_en}
        return texts.get(language, step.text_en)

    def total_steps(self) -> int:
        return len(self.steps)


# ═══════════════════════════════════════════════
# FIRST AID PROTOCOLS
# ═══════════════════════════════════════════════

PROTOCOLS: dict[str, FirstAidProtocol] = {
    "MEDICAL_EMERGENCY": FirstAidProtocol(
        emergency_type="MEDICAL_EMERGENCY",
        steps=[
            FirstAidStep(
                text_hi="सबसे पहले, क्या वे सांस ले रहे हैं? उनकी छाती देखें।",
                text_mr="सर्वप्रथम, ते श्वास घेत आहेत का? त्यांची छाती बघा.",
                text_en="First, are they breathing? Check their chest for movement."
            ),
            FirstAidStep(
                text_hi="उन्हें करवट से लिटाएं। सिर को थोड़ा ऊपर रखें।",
                text_mr="त्यांना कुशीवर झोपवा. डोके थोडे वर ठेवा.",
                text_en="Lay them on their side. Keep the head slightly elevated."
            ),
            FirstAidStep(
                text_hi="उनके कपड़े ढीले करें। हवा आने दें।",
                text_mr="त्यांचे कपडे सैल करा. हवा येऊ द्या.",
                text_en="Loosen their clothing. Allow air circulation."
            ),
            FirstAidStep(
                text_hi="उन्हें पानी पिलाएं, अगर वे होश में हैं। मदद आ रही है।",
                text_mr="त्यांना पाणी द्या, जर ते शुद्धीवर असतील. मदत येत आहे.",
                text_en="Give them water if conscious. Help is on the way."
            ),
        ]
    ),
    "HEATSTROKE": FirstAidProtocol(
        emergency_type="HEATSTROKE",
        steps=[
            FirstAidStep(
                text_hi="उन्हें तुरंत छाया में ले जाएं। धूप से बचाएं।",
                text_mr="त्यांना ताबडतोब सावलीत न्या. उन्हापासून वाचवा.",
                text_en="Move them to shade immediately. Protect from sun."
            ),
            FirstAidStep(
                text_hi="ठंडा पानी सिर और गर्दन पर डालें। गीला कपड़ा रखें।",
                text_mr="थंड पाणी डोक्यावर आणि मानेवर टाका. ओला कापड ठेवा.",
                text_en="Pour cool water on head and neck. Apply wet cloth."
            ),
            FirstAidStep(
                text_hi="पंखा करें या हवा दें। शरीर को ठंडा करें।",
                text_mr="पंखा करा किंवा हवा द्या. शरीर थंड करा.",
                text_en="Fan them. Cool the body down."
            ),
            FirstAidStep(
                text_hi="अगर होश में हैं तो छोटे-छोटे घूंट पानी पिलाएं। मदद आ रही है।",
                text_mr="शुद्धीवर असल्यास थोडे थोडे पाणी द्या. मदत येत आहे.",
                text_en="If conscious, give small sips of water. Help is arriving."
            ),
        ]
    ),
    "DROWNING": FirstAidProtocol(
        emergency_type="DROWNING",
        steps=[
            FirstAidStep(
                text_hi="पानी में न कूदें! आसपास कोई रस्सी या लकड़ी फेंकें।",
                text_mr="पाण्यात उडी मारू नका! जवळ दोर किंवा लाकूड फेका.",
                text_en="Do NOT jump in! Throw a rope or stick to them."
            ),
            FirstAidStep(
                text_hi="मदद के लिए ज़ोर से चिल्लाएं। आसपास के लोगों को बुलाएं।",
                text_mr="मोठ्याने मदतीसाठी ओरडा. जवळच्या लोकांना बोलवा.",
                text_en="Shout loudly for help. Alert people nearby."
            ),
            FirstAidStep(
                text_hi="अगर बाहर निकाल लिया तो उन्हें करवट से लिटाएं। बचावदल आ रहा है।",
                text_mr="बाहेर काढल्यास कुशीवर झोपवा. बचाव पथक येत आहे.",
                text_en="If pulled out, lay on side. Rescue team is coming."
            ),
        ]
    ),
    "CROWD_CRUSH": FirstAidProtocol(
        emergency_type="CROWD_CRUSH",
        steps=[
            FirstAidStep(
                text_hi="शांत रहें। अपने हाथ छाती के सामने रखें। सांस लेते रहें।",
                text_mr="शांत राहा. आपले हात छातीसमोर ठेवा. श्वास घेत राहा.",
                text_en="Stay calm. Keep hands in front of chest. Keep breathing."
            ),
            FirstAidStep(
                text_hi="भीड़ के बहाव के साथ चलें। विपरीत दिशा में न जाएं।",
                text_mr="गर्दीच्या प्रवाहाबरोबर चला. उलट दिशेला जाऊ नका.",
                text_en="Move with the crowd flow. Do not go against it."
            ),
            FirstAidStep(
                text_hi="किनारे की तरफ बढ़ने की कोशिश करें। दीवार या स्तंभ पकड़ें।",
                text_mr="कडेला जाण्याचा प्रयत्न करा. भिंत किंवा खांब पकडा.",
                text_en="Try to move to the edge. Grab a wall or pillar."
            ),
        ]
    ),
    "FIRE": FirstAidProtocol(
        emergency_type="FIRE",
        steps=[
            FirstAidStep(
                text_hi="आग से दूर हटें! सबको चेतावनी दें।",
                text_mr="आगीपासून दूर जा! सर्वांना सावध करा.",
                text_en="Move away from fire! Warn everyone around."
            ),
            FirstAidStep(
                text_hi="नाक और मुंह को गीले कपड़े से ढकें। नीचे रहकर निकलें।",
                text_mr="नाक आणि तोंड ओल्या कापडाने झाका. खाली राहून बाहेर या.",
                text_en="Cover nose and mouth with wet cloth. Stay low and exit."
            ),
            FirstAidStep(
                text_hi="खुले मैदान में जाएं। बचाव दल को रास्ता दिखाएं।",
                text_mr="मोकळ्या जागी जा. बचाव पथकाला मार्ग दाखवा.",
                text_en="Move to open ground. Guide rescue team to the spot."
            ),
        ]
    ),
    "MISSING_PERSON": FirstAidProtocol(
        emergency_type="MISSING_PERSON",
        steps=[
            FirstAidStep(
                text_hi="मुझे बताएं — खोया हुआ व्यक्ति कैसा दिखता है? उम्र और कपड़ों का रंग बताएं।",
                text_mr="मला सांगा — हरवलेली व्यक्ती कशी दिसते? वय आणि कपड्यांचा रंग सांगा.",
                text_en="Describe the missing person — age and clothing color."
            ),
            FirstAidStep(
                text_hi="आखिरी बार कहाँ देखा था? कोई खास जगह या मंदिर?",
                text_mr="शेवटचे कुठे बघितले? कोणती विशिष्ट जागा किंवा मंदिर?",
                text_en="Where were they last seen? Any specific landmark?"
            ),
            FirstAidStep(
                text_hi="ठीक है, हम उनकी तलाश शुरू कर रहे हैं। कृपया इसी जगह रुकें।",
                text_mr="ठीक आहे, आम्ही शोध सुरू करत आहोत. कृपया इथेच थांबा.",
                text_en="We are starting the search. Please stay at your location."
            ),
        ]
    ),
    "GENERAL_HELP": FirstAidProtocol(
        emergency_type="GENERAL_HELP",
        steps=[
            FirstAidStep(
                text_hi="मैं समझ गया। कृपया मुझे बताएं आपको क्या मदद चाहिए?",
                text_mr="मला समजले. कृपया मला सांगा तुम्हाला काय मदत हवी आहे?",
                text_en="I understand. Please tell me what help you need."
            ),
            FirstAidStep(
                text_hi="आपकी जानकारी दर्ज हो गई है। हमारी टीम आपसे संपर्क करेगी।",
                text_mr="तुमची माहिती नोंदवली गेली आहे. आमची टीम तुमच्याशी संपर्क करेल.",
                text_en="Your information has been recorded. Our team will contact you."
            ),
        ]
    ),
}


def get_first_aid_protocol(emergency_type: str) -> FirstAidProtocol:
    return PROTOCOLS.get(emergency_type, PROTOCOLS["GENERAL_HELP"])
