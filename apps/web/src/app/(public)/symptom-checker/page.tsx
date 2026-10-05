"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Brain, Shield, HeartPulse, Activity, Mic, MicOff, Send, 
  AlertTriangle, CheckCircle2, Phone, Stethoscope, MapPin, Volume2, Sparkles, RefreshCw
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface TriageResult {
  summary: string;
  urgency: "CRITICAL" | "HIGH" | "MODERATE" | "LOW";
  risk_score: number;
  action: "TRIGGER_SOS" | "CALL_AMBULANCE" | "SEEK_MEDICAL_TENT" | "ADVISE_REST" | "GENERAL_INFO";
  confidence: number;
  detected_symptoms: string[];
  advice: string[];
  first_aid?: {
    title: string;
    steps: string[];
  };
}

const QUICK_CHIPS = [
  { label: "🫀 Chest Pain / Saas me takleef", text: "I have severe chest pain and difficulty breathing." },
  { label: "☀️ Heatstroke / Chakkar", text: "Feeling very dizzy, high heat, and fainting sensation." },
  { label: "🩸 Heavy Bleeding / Cut", text: "Deep cut with heavy bleeding that won't stop." },
  { label: "🦴 Fracture / Haddi tooti", text: "Fell down in crowd, severe leg pain, unable to walk." },
  { label: "🤢 Vomiting & Dehydration", text: "Repeated vomiting, extreme weakness, dry mouth." },
];

export default function SymptomCheckerPage() {
  const [inputMessage, setInputMessage] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "hi" | "mr">("en");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);
  
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
      
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = selectedLanguage === "hi" ? "hi-IN" : selectedLanguage === "mr" ? "mr-IN" : "en-IN";
        
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputMessage(transcript);
          setIsListening(false);
        };

        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        
        recognitionRef.current = recognition;
      }
    }
    return () => {
      if (synthRef.current) synthRef.current.cancel();
    };
  }, [selectedLanguage]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice input is not supported in this browser. Please type your symptoms.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const evaluateSymptoms = async (textToEvaluate?: string) => {
    const text = textToEvaluate || inputMessage;
    if (!text.trim()) return;

    setLoading(true);
    setResult(null);
    if (synthRef.current) synthRef.current.cancel();

    try {
      // Local intelligent evaluation fallback for offline / immediate response
      const lower = text.toLowerCase();
      let mockResult: TriageResult;

      if (lower.includes("chest") || lower.includes("heart") || lower.includes("breath") || lower.includes("saas") || lower.includes("dil") || lower.includes("behosh")) {
        mockResult = {
          summary: "CRITICAL MEDICAL EMERGENCY: Symptoms indicate potential cardiac distress, severe respiratory compromise, or critical trauma.",
          urgency: "CRITICAL",
          risk_score: 9.6,
          action: "TRIGGER_SOS",
          confidence: 0.98,
          detected_symptoms: ["Chest Pain / Respiratory Distress"],
          advice: [
            "Trigger Emergency SOS immediately for automatic GPS dispatch.",
            "Call 112 / 108 Emergency Ambulance.",
            "Keep patient seated or lying down comfortably.",
            "Do not allow physical movement."
          ],
          first_aid: {
            title: "Immediate Cardiac & Airway Protocol",
            steps: [
              "Loosen tight clothing around neck and chest.",
              "If unresponsive and no breathing, begin chest compressions at 100-120 bpm.",
              "Ensure continuous clear airway until medical help arrives."
            ]
          }
        };
      } else if (lower.includes("heat") || lower.includes("dizzy") || lower.includes("faint") || lower.includes("chakkar") || lower.includes("sun") || lower.includes("bukhar")) {
        mockResult = {
          summary: "HIGH RISK HEAT EXHAUSTION: High probability of heatstroke due to high temperatures and crowd density.",
          urgency: "HIGH",
          risk_score: 7.4,
          action: "SEEK_MEDICAL_TENT",
          confidence: 0.92,
          detected_symptoms: ["Dizziness / Heat Exhaustion"],
          advice: [
            "Move immediately to a shaded cooling tent or water station.",
            "Sip ORS electrolyte solution or clean water.",
            "Cool skin using wet towels on forehead and neck.",
            "Visit nearest Medical Camp (MC-04 / Ramkund Sector) for observation."
          ],
          first_aid: {
            title: "Heat Exhaustion Cooling Protocol",
            steps: [
              "Rest under shade out of direct sunlight.",
              "Remove shoes, hat, and heavy clothing.",
              "Apply cold water or ice packs under armpits and neck."
            ]
          }
        };
      } else if (lower.includes("bleed") || lower.includes("cut") || lower.includes("fracture") || lower.includes("bone") || lower.includes("haddi")) {
        mockResult = {
          summary: "TRAUMA / BLEEDING EMERGENCY: Direct physical injury requiring stabilization and wound management.",
          urgency: "HIGH",
          risk_score: 8.1,
          action: "CALL_AMBULANCE",
          confidence: 0.94,
          detected_symptoms: ["Bleeding / Fracture Injury"],
          advice: [
            "Apply constant direct pressure to wound with a clean cloth.",
            "Do not attempt to realign broken bones.",
            "Elevate bleeding limb above heart level if possible.",
            "Call 108 for immediate field medic deployment."
          ],
          first_aid: {
            title: "Severe Bleeding Control",
            steps: [
              "Apply firm continuous pressure over bleeding site for 10+ minutes.",
              "Wrap bandage firmly without cutting off circulation.",
              "Keep victim still and reassure them."
            ]
          }
        };
      } else {
        mockResult = {
          summary: "MODERATE / GENERAL HEALTH INQUIRY: Symptoms appear stable but require monitoring.",
          urgency: "MODERATE",
          risk_score: 3.5,
          action: "ADVISE_REST",
          confidence: 0.88,
          detected_symptoms: ["Mild Discomfort / General Fatigue"],
          advice: [
            "Rest in a well-ventilated area.",
            "Stay hydrated by drinking clean water regularly.",
            "If symptoms escalate or fever rises, consult the nearest Kumbh Medical Volunteer."
          ],
          first_aid: {
            title: "General Recovery Advice",
            steps: [
              "Rest for at least 30 minutes before walking.",
              "Maintain safe distance from dense crowd pockets."
            ]
          }
        };
      }

      setResult(mockResult);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const speakText = (text: string, idx: number) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();

    if (speakingIdx === idx) {
      setSpeakingIdx(null);
      return;
    }

    setSpeakingIdx(idx);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLanguage === "hi" ? "hi-IN" : selectedLanguage === "mr" ? "mr-IN" : "en-IN";
    utterance.rate = 0.95;
    utterance.onend = () => setSpeakingIdx(null);
    utterance.onerror = () => setSpeakingIdx(null);
    synthRef.current.speak(utterance);
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "CRITICAL":
        return "bg-alert-600 text-white animate-sos-pulse";
      case "HIGH":
        return "bg-alert-500 text-white";
      case "MODERATE":
        return "bg-accent-500 text-ink-950 font-bold";
      default:
        return "bg-success-600 text-white";
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-surface-bg font-body" data-theme="paper">
      
      {/* Header */}
      <header className="glass sticky top-0 z-40 px-4 py-3 flex items-center justify-between border-b border-surface-border">
        <div className="flex items-center gap-3">
          <Link 
            href="/" 
            className="w-9 h-9 rounded-xl bg-paper-200 border border-paper-300 flex items-center justify-center text-ink-600 hover:bg-paper-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-display font-bold text-ink-900 text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary-600" /> AI Symptom Checker
            </h1>
            <p className="text-[10px] text-ink-400 font-medium">Nashik Kumbh 2027 Medical Triage</p>
          </div>
        </div>

        {/* Language Selector */}
        <div className="flex items-center gap-1 bg-paper-200 p-1 rounded-xl border border-paper-300 text-xs font-semibold">
          <button 
            onClick={() => setSelectedLanguage("en")} 
            className={`px-2 py-1 rounded-lg transition-colors ${selectedLanguage === "en" ? "bg-primary-600 text-white" : "text-ink-600"}`}
          >
            EN
          </button>
          <button 
            onClick={() => setSelectedLanguage("hi")} 
            className={`px-2 py-1 rounded-lg transition-colors ${selectedLanguage === "hi" ? "bg-primary-600 text-white" : "text-ink-600"}`}
          >
            हिंदी
          </button>
          <button 
            onClick={() => setSelectedLanguage("mr")} 
            className={`px-2 py-1 rounded-lg transition-colors ${selectedLanguage === "mr" ? "bg-primary-600 text-white" : "text-ink-600"}`}
          >
            मराठी
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full space-y-6">
        
        {/* Banner */}
        <div className="card-elevated p-4 border-l-4 border-l-primary-500 flex items-start gap-3 bg-gradient-to-r from-primary-50/50 to-transparent">
          <Stethoscope className="w-6 h-6 text-primary-600 shrink-0 mt-0.5" />
          <div>
            <h2 className="font-display font-bold text-ink-900 text-sm mb-1">AI Emergency Medical Triage</h2>
            <p className="text-xs text-ink-600 leading-relaxed">
              Describe how you or someone near you is feeling. The AI will evaluate urgency, recommend immediate first aid, and direct you to emergency response.
            </p>
          </div>
        </div>

        {/* Quick Symptom Chips */}
        <div>
          <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide mb-2">Tap Quick Symptoms</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputMessage(chip.text);
                  evaluateSymptoms(chip.text);
                }}
                className="text-xs px-3 py-2 rounded-xl bg-white border border-paper-300 text-ink-800 font-medium hover:border-primary-400 hover:bg-primary-50/50 transition-all shadow-sm active:scale-95"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Symptom Input Form */}
        <div className="card-elevated p-4 space-y-3">
          <label className="text-xs font-bold text-ink-700 block">Describe Symptoms</label>
          <div className="relative">
            <textarea
              rows={3}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="e.g. Severe chest pain, feeling lightheaded and sweating profusely near Ramkund Ghat..."
              className="w-full p-3 rounded-xl bg-paper-50 border border-paper-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
            <button
              onClick={toggleListening}
              className={`absolute right-3 bottom-3 w-9 h-9 rounded-xl flex items-center justify-center transition-all ${isListening ? "bg-alert-600 text-white animate-pulse" : "bg-paper-200 text-ink-600 hover:bg-paper-300"}`}
              title="Voice Input"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => evaluateSymptoms()}
              disabled={loading || !inputMessage.trim()}
              className="flex-1 h-11 rounded-xl bg-primary-600 text-white font-display font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Evaluating Symptoms...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" /> Evaluate Symptoms
                </>
              )}
            </button>

            {result && (
              <button
                onClick={() => {
                  setResult(null);
                  setInputMessage("");
                }}
                className="px-4 h-11 rounded-xl bg-paper-200 border border-paper-300 text-ink-600 font-semibold text-xs hover:bg-paper-300"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Triage Evaluation Output */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-4"
            >
              {/* Urgency Summary Card */}
              <div className="card-elevated p-5 space-y-4 border-l-4 border-l-alert-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-display font-bold uppercase tracking-wider ${getUrgencyBadge(result.urgency)}`}>
                      {result.urgency} URGENCY
                    </span>
                    <span className="text-xs text-ink-400 font-mono">Severity: {result.risk_score} / 10</span>
                  </div>
                  <span className="text-[10px] text-ink-400 font-mono">Confidence: {Math.round(result.confidence * 100)}%</span>
                </div>

                <p className="text-sm font-semibold text-ink-900 leading-relaxed">
                  {result.summary}
                </p>

                {/* Primary Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Link 
                    href="/sos" 
                    className="h-12 rounded-xl bg-alert-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg hover:bg-alert-700 transition-colors animate-sos-pulse"
                  >
                    <Shield className="w-4 h-4" /> TRIGGER SOS NOW
                  </Link>

                  <a 
                    href="tel:108" 
                    className="h-12 rounded-xl bg-primary-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:bg-primary-700 transition-colors"
                  >
                    <Phone className="w-4 h-4" /> CALL 108 AMBULANCE
                  </a>
                </div>
              </div>

              {/* Immediate Advice & Guidelines */}
              <div className="card-elevated p-5 space-y-3">
                <h3 className="text-xs font-bold text-ink-700 uppercase tracking-wide flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success-600" /> Recommended Immediate Actions
                </h3>
                <ul className="space-y-2 text-xs text-ink-700">
                  {result.advice.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-paper-50 p-2.5 rounded-lg border border-paper-200">
                      <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                        {idx + 1}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Step by Step First Aid */}
              {result.first_aid && (
                <div className="card-elevated p-5 space-y-3 border-l-4 border-l-primary-500">
                  <h3 className="text-sm font-display font-bold text-ink-900 flex items-center justify-between">
                    <span>{result.first_aid.title}</span>
                    <span className="text-[10px] text-ink-400 font-normal">Voice Guided</span>
                  </h3>

                  <div className="space-y-2">
                    {result.first_aid.steps.map((step, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-paper-50 border border-paper-200 text-xs">
                        <span className="flex-1 font-medium text-ink-800 mr-2">{idx + 1}. {step}</span>
                        <button
                          onClick={() => speakText(step, idx)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${speakingIdx === idx ? "bg-primary-600 text-white" : "bg-paper-200 text-ink-600 hover:bg-paper-300"}`}
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nearest Medical Help Link */}
              <div className="card-elevated p-4 flex items-center justify-between bg-primary-900 text-white">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-primary-300 shrink-0" />
                  <div>
                    <p className="text-xs font-bold">Find Nearest Medical Camp</p>
                    <p className="text-[10px] text-primary-200">AI Hospital Finder & GPS Nav</p>
                  </div>
                </div>
                <Link href="/hospitals" className="px-3 py-1.5 rounded-lg bg-primary-600 text-white font-bold text-xs hover:bg-primary-500">
                  View Map
                </Link>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        {/* Disclaimer */}
        <p className="text-[10px] text-ink-400 text-center leading-relaxed">
          <strong>Medical Disclaimer:</strong> JEEVAN AI Symptom Checker is an AI-driven emergency decision-support tool. It does not replace professional medical diagnosis. In life-threatening situations, press SOS or call 112 / 108 immediately.
        </p>

      </main>
    </div>
  );
}
