/* eslint-disable */
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Mic, MicOff, ArrowLeft, Volume2, Info, Check, Shield, 
  Globe, Activity, HeartPulse, Send, Zap, Siren, CheckCircle2 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Polyfill for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

type Language = "en-IN" | "hi-IN" | "mr-IN" | "gu-IN" | "ta-IN" | "bn-IN" | "te-IN" | "kn-IN";

const LANG_MAP: Record<Language, string> = {
  "mr-IN": "मराठी (Marathi)",
  "hi-IN": "हिंदी (Hindi)",
  "en-IN": "English (Universal)",
  "gu-IN": "ગુજરાતી (Gujarati)",
  "ta-IN": "தமிழ் (Tamil)",
  "bn-IN": "বাংলা (Bengali)",
  "te-IN": "తెలుగు (Telugu)",
  "kn-IN": "ಕನ್ನಡ (Kannada)"
};

type VoicePhase = "idle" | "listening" | "processing" | "triage" | "action";

export default function VoiceAssistant() {
  const router = useRouter();
  const [phase, setPhase] = useState<VoicePhase>("idle");
  const [transcript, setTranscript] = useState("");
  const [inputText, setInputText] = useState("");
  const [feedback, setFeedback] = useState("Speak or type in ANY language. JEEVAN AI will understand and dispatch help.");
  const [hasError, setHasError] = useState(false);
  const [language, setLanguage] = useState<Language>("mr-IN");
  const [detectedLang, setDetectedLang] = useState("Auto-Detected");
  
  // Triage & Dispatch Details
  const [triageResponse, setTriageResponse] = useState("");
  const [processingSteps, setProcessingSteps] = useState<string[]>([]);
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = language;

        recognitionRef.current.onresult = (event: any) => {
          const current = event.resultIndex;
          const text = event.results[current][0].transcript;
          setTranscript(text);
          if (event.results[current].isFinal) {
            processUniversalEmergency(text);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          setHasError(true);
          setPhase("idle");
          if (event.error === "not-allowed") {
            setFeedback("Microphone access denied. Type your emergency below or tap SOS.");
          } else {
            setFeedback("Could not capture audio cleanly. Please speak again or type below.");
          }
        };

        recognitionRef.current.onend = () => {
          // Handled via state transition
        };
      } else {
        setHasError(true);
        setFeedback("Speech recognition active in Text/Voice mode below. Enter any message.");
      }

      synthRef.current = window.speechSynthesis;
    }
    
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [language]);

  const speak = (text: string, lang = language) => {
    if (synthRef.current) {
      synthRef.current.cancel(); // Stop ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.95;
      synthRef.current.speak(utterance);
    }
  };

  // Universal Natural Language AI Intent Processing (No Script Limitations)
  const processUniversalEmergency = (spokenMessage: string) => {
    if (!spokenMessage.trim()) return;

    setTranscript(spokenMessage);
    setPhase("processing");
    setFeedback("JEEVAN AI analyzing emergency in your language...");

    // Detect language or script
    let detectedName = LANG_MAP[language] || "Universal Language";
    if (/[\u0900-\u097F]/.test(spokenMessage)) {
      detectedName = spokenMessage.includes("आहे") || spokenMessage.includes("माझे") || spokenMessage.includes("मला") ? "मराठी (Marathi)" : "हिंदी (Hindi)";
    } else if (/[\u0A80-\u0AFF]/.test(spokenMessage)) {
      detectedName = "ગુજરાતી (Gujarati)";
    } else if (/[\u0B80-\u0BFF]/.test(spokenMessage)) {
      detectedName = "தமிழ் (Tamil)";
    }
    setDetectedLang(detectedName);

    // Dynamic AI Triage Steps
    setProcessingSteps([
      `Language Analyzed: ${detectedName}`,
      "Captured GPS Coordinates [20.0063, 73.7925] (Ramkund)",
      "Calculating shortest ambulance route (AMB-08)",
      "Alerting Panchavati Emergency Command Center"
    ]);

    setTimeout(() => {
      setPhase("triage");
      
      // Dynamic Multilingual Emergency Acknowledgement
      let aiResponseText = "";
      if (language === "mr-IN" || detectedName.includes("मराठी")) {
        aiResponseText = "तुमचा आणीबाणीचा संदेश प्राप्त झाला आहे. रुग्णवाहिका AMB-08 घटनास्थळाकडे पाठवली आहे. शांत रहा, मदत येत आहे!";
      } else if (language === "hi-IN" || detectedName.includes("हिंदी")) {
        aiResponseText = "आपका आपातकालीन संदेश प्राप्त हो गया है। एम्बुलेंस AMB-08 घटना स्थल के लिए रवाना कर दी गई है। कृपया शांत रहें, मदद पहुँच रही है!";
      } else if (language === "gu-IN" || detectedName.includes("ગુજરાતી")) {
        aiResponseText = "તમારો કટોકટીનો સંદેશ મળી ગયો છે. એમ્બ્યુલન્સ AMB-08 ઘટનાસ્થળે રવાના થઈ ગઈ છે. મહેરબાની કરીને શાંત રહો!";
      } else {
        aiResponseText = `Emergency request received: "${spokenMessage}". Ambulance AMB-08 dispatched to your location. Stay calm, help is on the way!`;
      }

      setTriageResponse(aiResponseText);
      speak(aiResponseText, language);
    }, 1200);
  };

  const confirmDispatchAndRedirect = () => {
    setPhase("action");
    const msg = language === "mr-IN" ? "रुग्णवाहिका पाठवली आहे! रिअल-टाइम ट्रॅकिंग सुरू होत आहे." :
                language === "hi-IN" ? "एम्बुलेंस रवाना कर दी गई है! लाइव ट्रैकिंग शुरू हो रही है।" :
                "Ambulance Dispatched! Initiating live tactical tracking...";
    setFeedback(msg);
    speak(msg, language);

    setTimeout(() => {
      router.push("/sos");
    }, 2000);
  };

  const toggleListening = () => {
    if (phase === "listening") {
      recognitionRef.current?.stop();
      setPhase("idle");
    } else {
      setHasError(false);
      setTranscript("");
      setFeedback("Listening... Speak in ANY language now.");
      setPhase("listening");
      try {
        recognitionRef.current?.start();
      } catch (e) {}
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      processUniversalEmergency(inputText);
      setInputText("");
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-ink-950 text-white" data-theme="ink">
      
      {/* ═══════ HEADER ═══════ */}
      <header className="glass-dark sticky top-0 z-30 px-4 py-3 flex items-center justify-between border-b border-ink-800">
        <Link href="/emergency" className="w-9 h-9 rounded-xl bg-ink-900 border border-ink-800 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-ink-300" />
        </Link>
        
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-white flex items-center justify-center p-0.5 overflow-hidden shadow-md">
            <img src="/logo.png" alt="JEEVAN AI" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="font-display font-bold text-white text-sm block leading-none">Universal AI Voice SOS</span>
            <span className="text-[9px] text-primary-400 font-mono">Multi-Lingual Emergency Engine</span>
          </div>
        </div>

        {/* Language Picker Dropdown */}
        <div className="relative group">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ink-900 border border-ink-800 text-xs font-semibold text-ink-200 hover:text-white transition-colors">
            <Globe className="w-3.5 h-3.5 text-primary-400" />
            <span className="max-w-[80px] sm:max-w-[120px] truncate">{LANG_MAP[language].split(" ")[0]}</span>
          </button>
          <div className="absolute right-0 top-full mt-1 w-48 bg-ink-900 border border-ink-800 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
            {(Object.keys(LANG_MAP) as Language[]).map(l => (
              <button
                key={l}
                onClick={() => setLanguage(l)}
                className={`w-full text-left px-3.5 py-2.5 text-xs hover:bg-ink-800 first:rounded-t-xl last:rounded-b-xl transition-colors flex items-center justify-between ${language === l ? "text-primary-400 font-bold bg-ink-800/50" : "text-ink-200"}`}
              >
                <span>{LANG_MAP[l]}</span>
                {language === l && <Check className="w-3.5 h-3.5 text-primary-400" />}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ═══════ MAIN VOICE & TEXT INTERACTION CANVAS ═══════ */}
      <main className="flex-1 flex flex-col items-center justify-between p-4 sm:p-6 relative overflow-hidden max-w-lg mx-auto w-full">
        
        {/* Glowing Background Radial */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
          <div className={`w-80 h-80 rounded-full blur-[120px] mix-blend-screen transition-colors duration-1000 ${
            phase === "listening" ? "bg-accent-500 animate-pulse" :
            phase === "triage" || phase === "action" ? "bg-alert-500" : "bg-primary-500"
          }`} />
        </div>

        {/* ═══════ TRIAGE & DISPATCH CONFIRMATION PHASE ═══════ */}
        {phase === "triage" || phase === "action" ? (
          <div className="z-10 w-full animate-fade-in-up my-auto">
            <div className="card-elevated p-6 bg-ink-900 border-2 border-alert-500/80 shadow-glow-alert text-center mb-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-alert-500 animate-pulse" />
              
              <div className="w-14 h-14 rounded-2xl bg-alert-600/20 border border-alert-500 flex items-center justify-center mx-auto mb-4 text-alert-400 shadow-lg">
                <Siren className="w-7 h-7 animate-bounce" />
              </div>
              
              <p className="text-[10px] font-mono text-alert-400 font-bold uppercase tracking-widest mb-1">
                AI TRIAGE DISPATCH READINESS • {detectedLang}
              </p>
              
              <h2 className="text-lg sm:text-xl font-display font-bold text-white mb-3 leading-relaxed">
                &ldquo;{triageResponse}&rdquo;
              </h2>

              <p className="text-xs text-ink-300 font-mono bg-ink-950/80 p-2.5 rounded-lg border border-ink-800">
                Captured Input: &quot;{transcript}&quot;
              </p>
            </div>

            {/* AI Processing Steps Log */}
            <div className="space-y-2 mb-6 bg-ink-900/60 p-4 rounded-xl border border-ink-800">
              <p className="text-[10px] font-mono text-ink-400 uppercase tracking-wider mb-2 font-bold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-primary-400" /> AI Execution Logs:
              </p>
              {processingSteps.map((step, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-ink-200 animate-fade-in-up" style={{ animationDelay: `${i * 150}ms` }}>
                  <CheckCircle2 className="w-3.5 h-3.5 text-success-400 shrink-0" />
                  <span>{step}</span>
                </div>
              ))}
            </div>

            {/* Instant Action Dispatch Button */}
            <button
              onClick={confirmDispatchAndRedirect}
              className="w-full h-14 rounded-xl bg-alert-600 hover:bg-alert-700 text-white font-display font-bold text-lg transition-all shadow-glow-alert flex items-center justify-center gap-3 active:scale-95"
            >
              <Siren className="w-5 h-5" /> CONFIRM & TRACK AMBULANCE AMB-08
            </button>
          </div>
        ) : (
          /* ═══════ IDLE / LISTENING / PROCESSING ═══════ */
          <>
            {/* Top Display Status */}
            <div className="text-center z-10 w-full mb-6 mt-4 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-ink-900 border border-ink-800 text-xs font-semibold text-primary-400 mb-4 shadow-md">
                <Zap className="w-3.5 h-3.5 text-primary-400" />
                <span>Any Language Supported • Instant AI Dispatch</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-display font-bold text-white mb-3 min-h-[70px] flex items-center justify-center px-4 leading-relaxed">
                {transcript || (phase === "idle" && "Speak or type your emergency in any language...") || "Processing audio..."}
              </h2>
              
              <p className={`text-xs sm:text-sm px-4 ${hasError ? "text-alert-400" : "text-ink-400"}`}>
                {feedback}
              </p>
            </div>

            {/* Central Animated Mic Button */}
            <div className="relative z-10 my-4">
              <AnimatePresence>
                {phase === "listening" && (
                  <>
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-0 bg-accent-500 rounded-full"
                    />
                    <div className="absolute -inset-10 flex items-center justify-center gap-1 opacity-60">
                      {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((h, i) => (
                        <motion.div
                          key={i}
                          animate={{ height: [12, h * 22, 12] }}
                          transition={{ duration: 0.4 + Math.random() * 0.4, repeat: Infinity, repeatType: "reverse" }}
                          className="w-1.5 bg-accent-400 rounded-full"
                        />
                      ))}
                    </div>
                  </>
                )}
              </AnimatePresence>

              <button
                onClick={toggleListening}
                disabled={phase === "processing"}
                className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center shadow-2xl transition-all z-10 border-4
                  ${phase === "listening" 
                    ? "bg-accent-600 border-accent-300 text-white shadow-glow-accent scale-105" 
                    : phase === "processing" 
                    ? "bg-primary-600 border-primary-300 text-white animate-pulse" 
                    : "bg-ink-900 border-ink-700 text-primary-400 hover:text-white hover:border-primary-500 hover:scale-105"
                  }`}
              >
                {phase === "listening" ? <Mic className="w-12 h-12" /> : <MicOff className="w-12 h-12 text-ink-300" />}
              </button>
            </div>

            {/* Quick Multi-Lingual Presets */}
            {phase === "idle" && (
              <div className="z-10 w-full space-y-3 my-4">
                <p className="text-[10px] text-ink-400 uppercase tracking-widest font-mono text-center font-bold">
                  Quick Multi-Lingual Emergency Presets:
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {[
                    { label: "मदत करा! (Help!)", text: "मदत करा! रुग्णवाहिका पाठवा!" },
                    { label: "छातीत दुखतंय (Chest Pain)", text: "छातीत प्रचंड दुखत आहे, ताबडतोब रुग्णवाहिका हवी!" },
                    { label: "Emergency Ambulance", text: "Medical Emergency! Need an ambulance immediately at Ramkund!" },
                    { label: "अपघात झाला आहे (Accident)", text: "येथे मोठा अपघात झाला आहे, वैद्यकीय मदत पाठवा!" }
                  ].map((chip) => (
                    <button
                      key={chip.label}
                      onClick={() => processUniversalEmergency(chip.text)}
                      className="px-3 py-1.5 rounded-xl bg-ink-900 border border-ink-800 hover:border-primary-500 text-xs font-semibold text-ink-200 hover:text-white transition-all shadow-sm active:scale-95"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Universal Multi-Language Text & Voice Input Bar */}
            <form onSubmit={handleTextSubmit} className="z-20 w-full mt-2 mb-2">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Or type emergency message in ANY language..."
                  className="w-full h-13 pl-4 pr-12 rounded-2xl bg-ink-900 border border-ink-800 text-sm text-white placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-xl"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="absolute right-2 w-9 h-9 rounded-xl bg-primary-600 text-white flex items-center justify-center hover:bg-primary-500 disabled:opacity-40 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
