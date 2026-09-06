/* eslint-disable */
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, ArrowLeft, Shield, Globe, MapPin, CheckCircle2, Activity, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type CallPhase = "idle" | "ringing" | "connected" | "ended";
type Language = "hi" | "mr" | "en";

interface ChatMessage {
  id: number;
  role: "agent" | "caller";
  text: string;
  timestamp: Date;
}

const LANG_LABELS: Record<Language, string> = { hi: "हिंदी", mr: "मराठी", en: "English" };
const LANG_CODES: Record<Language, string> = { hi: "hi-IN", mr: "mr-IN", en: "en-IN" };

const VOICE_AGENT_WS = process.env.NEXT_PUBLIC_VOICE_AGENT_WS || "ws://localhost:8001/api/v1/ws/voice-call";

export default function VoiceCallPage() {
  const [phase, setPhase] = useState<CallPhase>("idle");
  const [language, setLanguage] = useState<Language>("hi");
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [callDuration, setCallDuration] = useState(0);
  const [emergencyType, setEmergencyType] = useState("");
  const [severity, setSeverity] = useState("");
  const [landmark, setLandmark] = useState("");
  const [ticketId, setTicketId] = useState("");
  const [callState, setCallState] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const msgIdRef = useRef(0);
  const recognitionRef = useRef<any>(null);
  const isAgentSpeakingRef = useRef(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (phase === "connected") {
      timerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
      initSpeechRecognition();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopSpeechRecognition();
      window.speechSynthesis.cancel();
    };
  }, [phase]);

  // Restart recognition if language changes or unmuted
  useEffect(() => {
    if (phase === "connected") {
      stopSpeechRecognition();
      if (!isMuted) {
        initSpeechRecognition();
      }
    }
  }, [language, isMuted]);

  const initSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = LANG_CODES[language];

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
      setIsListening(false);
      // Auto-restart if we are connected, not muted, and the agent isn't currently speaking
      if (phase === "connected" && !isMuted && !isAgentSpeakingRef.current) {
        try { recognition.start(); } catch {}
      }
    };
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript.trim()) {
        handleSend(transcript);
      }
    };

    recognitionRef.current = recognition;
    if (!isAgentSpeakingRef.current && !isMuted) {
      try { recognition.start(); } catch {}
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    setIsListening(false);
  };

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const addMessage = useCallback((role: "agent" | "caller", text: string) => {
    msgIdRef.current++;
    setMessages(prev => [...prev, { id: msgIdRef.current, role, text, timestamp: new Date() }]);
  }, []);

  const speakText = useCallback((text: string) => {
    if (!isSpeakerOn) return;
    
    // Stop mic while agent speaks
    isAgentSpeakingRef.current = true;
    stopSpeechRecognition();

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANG_CODES[language];
    utterance.rate = 1.0;
    
    // Try to find a local voice that matches the language
    const voices = window.speechSynthesis.getVoices();
    const targetVoice = voices.find(v => v.lang.startsWith(LANG_CODES[language].split('-')[0]));
    if (targetVoice) utterance.voice = targetVoice;

    utterance.onend = () => {
      isAgentSpeakingRef.current = false;
      // Restart mic
      if (phase === "connected" && !isMuted) {
        try { recognitionRef.current?.start(); } catch {}
      }
    };

    window.speechSynthesis.speak(utterance);
  }, [isSpeakerOn, language, phase, isMuted]);

  const playAudio = useCallback((b64: string) => {
    if (!isSpeakerOn) return;
    try {
      const blob = new Blob(
        [Uint8Array.from(atob(b64), c => c.charCodeAt(0))],
        { type: "audio/mpeg" }
      );
      const url = URL.createObjectURL(blob);
      if (audioRef.current) { audioRef.current.pause(); URL.revokeObjectURL(audioRef.current.src); }
      const audio = new Audio(url);
      audioRef.current = audio;
      
      isAgentSpeakingRef.current = true;
      stopSpeechRecognition();
      
      audio.onended = () => {
        isAgentSpeakingRef.current = false;
        if (phase === "connected" && !isMuted) {
          try { recognitionRef.current?.start(); } catch {}
        }
      };
      
      audio.play().catch(() => {
        isAgentSpeakingRef.current = false;
      });
    } catch {}
  }, [isSpeakerOn, phase, isMuted]);

  const agentReply = useCallback((text: string) => {
    addMessage("agent", text);
    speakText(text);
  }, [addMessage, speakText]);

  const startCall = useCallback(() => {
    setPhase("ringing");
    setMessages([]);
    setCallDuration(0);
    setEmergencyType("");
    setSeverity("");
    setLandmark("");
    setTicketId("");
    setCallState("");

    setTimeout(() => {
      try {
        const ws = new WebSocket(VOICE_AGENT_WS);
        wsRef.current = ws;

        ws.onopen = () => setPhase("connected");

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.text) addMessage("agent", data.text);
            if (data.audio) playAudio(data.audio);
            if (data.emergency_type) setEmergencyType(data.emergency_type);
            if (data.severity) setSeverity(data.severity);
            if (data.landmark) setLandmark(data.landmark);
            if (data.ticket_id) setTicketId(data.ticket_id);
            if (data.state) setCallState(data.state);
            setIsProcessing(false);
          } catch {}
        };

        ws.onerror = () => {
          // Fallback to local browser AI mode
          setPhase("connected");
          agentReply(language === "mr"
            ? "नमस्कार! जीवन AI आणीबाणी सहायता मध्ये आपले स्वागत आहे. मी तुमच्या मदतीसाठी येथे आहे. ही कॉल तुमच्या सुरक्षिततेसाठी रेकॉर्ड केली जात आहे. कृपया तुमची समस्या सांगा."
            : language === "en"
            ? "Namaskar! Welcome to JEEVAN AI Emergency Helpline. I am here to help you. This call is recorded for your safety. Please describe your emergency."
            : "नमस्कार! जीवन AI आपातकालीन सहायता में आपका स्वागत है। मैं आपकी मदद के लिए यहाँ हूँ। यह कॉल आपकी सुरक्षा के लिए रिकॉर्ड की जा रही है। कृपया अपनी समस्या बताएं।"
          );
        };

        ws.onclose = () => { if (phase !== "ended") setPhase("ended"); };
      } catch {
        setPhase("connected");
        agentReply("नमस्कार! जीवन AI आपातकालीन सहायता में आपका स्वागत है। कृपया अपनी समस्या बताएं।");
      }
    }, 2000);
  }, [language, agentReply, addMessage, playAudio, phase]);

  const endCall = useCallback(() => {
    if (wsRef.current) {
      try { wsRef.current.send(JSON.stringify({ type: "control", action: "end" })); } catch {}
      wsRef.current.close();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    stopSpeechRecognition();
    window.speechSynthesis.cancel();
    setPhase("ended");
  }, []);

  const handleSend = useCallback((textToProcess: string) => {
    const text = textToProcess.trim();
    if (!text) return;
    addMessage("caller", text);
    setInputText("");
    setIsProcessing(true);
    
    // Stop listening while processing
    stopSpeechRecognition();

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "text", data: text }));
    } else {
      // Local Browser Offline Simulation Engine
      setTimeout(() => {
        const lower = text.toLowerCase();
        const isEmergency = ["gir", "padla", "help", "emergency", "bachao", "madad", "blood", "pain", "fire", "aag", "doob", "behosh", "missing", "kho", "chot", "accident"].some(k => lower.includes(k));
        const hasLandmark = ["ramkund", "panchavati", "kalaram", "godavari", "tapovan", "trimbak", "kushavart", "ghat", "mandir", "temple"].some(k => lower.includes(k));

        if (isEmergency && !emergencyType) {
          setEmergencyType("MEDICAL_EMERGENCY");
          setSeverity("CRITICAL");
          if (hasLandmark) {
            const lm = lower.includes("ramkund") ? "Ramkund" : lower.includes("panchavati") ? "Panchavati" : lower.includes("kalaram") ? "Kalaram Temple" : "Godavari Ghats";
            setLandmark(lm);
            agentReply(language === "mr"
              ? `मला समजले. वैद्यकीय आणीबाणी — ${lm} जवळ. ते शुद्धीवर आहेत का? किती लोक प्रभावित आहेत?`
              : language === "en"
              ? `I understand. Medical Emergency near ${lm}. Are they conscious? How many people are affected?`
              : `मुझे समझ आ गया। चिकित्सा आपातकाल — ${lm} के पास। क्या वे होश में हैं? कितने लोग प्रभावित हैं?`);
          } else {
            agentReply(language === "mr"
              ? "मला समजले — वैद्यकीय आणीबाणी. तुम्ही कुठे आहात? कोणते मंदिर, घाट किंवा जागेचे नाव सांगा."
              : language === "en"
              ? "I understand — Medical Emergency. Where are you? Tell me the nearest temple, ghat, or landmark."
              : "मुझे समझ आ गया — चिकित्सा आपातकाल। आप कहाँ हैं? कोई मंदिर, घाट या जगह का नाम बताएं।");
          }
        } else if (emergencyType && !landmark && hasLandmark) {
          const lm = lower.includes("ramkund") ? "Ramkund" : lower.includes("panchavati") ? "Panchavati" : "Godavari Ghats";
          setLandmark(lm);
          agentReply(language === "mr"
            ? `ठीक आहे, ${lm} जवळ. ते शुद्धीवर आहेत का?`
            : language === "en"
            ? `OK, near ${lm}. Are they conscious?`
            : `ठीक है, ${lm} के पास। क्या वे होश में हैं?`);
        } else if (emergencyType && landmark && !ticketId) {
          const tid = `VT-${Date.now().toString(36).slice(-6).toUpperCase()}`;
          setTicketId(tid);
          setCallState("PROVIDE_GUIDANCE");
          agentReply(language === "mr"
            ? "मदत पाठवली जात आहे. तोपर्यंत हे करा — सर्वप्रथम, ते श्वास घेत आहेत का? त्यांची छाती बघा."
            : language === "en"
            ? "Help is being dispatched. Meanwhile — first, are they breathing? Check their chest."
            : "मदद भेजी जा रही है। तब तक ये करें — सबसे पहले, क्या वे सांस ले रहे हैं? उनकी छाती देखें।");
        } else if (ticketId) {
          agentReply(language === "mr"
            ? "मदत वाटेवर आहे. शांत राहा. मी तुमच्यासोबत आहे. अजून काही सांगायचे आहे का?"
            : language === "en"
            ? "Help is on the way. Stay calm. I am with you. Anything else?"
            : "मदद रास्ते में है। शांत रहें। मैं आपके साथ हूँ। क्या और कुछ बताना है?");
        } else {
          agentReply(language === "mr"
            ? "कृपया तुमची समस्या सांगा. कोणी जखमी आहे का? कोणी धोक्यात आहे का?"
            : language === "en"
            ? "Please describe the emergency. Is someone injured or in danger?"
            : "कृपया अपनी समस्या बताएं। क्या कोई घायल है? क्या कोई खतरे में है?");
        }
        setIsProcessing(false);
      }, 1500);
    }
  }, [inputText, language, emergencyType, landmark, ticketId, agentReply]);

  const sevColor = severity === "CRITICAL" ? "bg-red-500" : severity === "HIGH" ? "bg-orange-500" : "bg-blue-500";

  return (
    <div className="min-h-[100dvh] flex flex-col bg-ink-950" data-theme="ink">
      {/* Header */}
      <header className="glass-dark sticky top-0 z-30 px-4 py-3 flex items-center justify-between border-b border-ink-800">
        <Link href="/emergency" className="w-9 h-9 rounded-xl bg-ink-900 border border-ink-800 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-ink-300" />
        </Link>
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-primary-400" />
          <span className="font-display font-bold text-white text-sm">JEEVAN AI Helpline</span>
        </div>
        <div className="relative group">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ink-900 border border-ink-800 text-xs font-semibold text-ink-300">
            <Globe className="w-3.5 h-3.5" />
            {LANG_LABELS[language]}
          </button>
          <div className="absolute right-0 top-full mt-1 w-28 bg-ink-900 border border-ink-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
            {(Object.keys(LANG_LABELS) as Language[]).map(l => (
              <button key={l} onClick={() => setLanguage(l)} className={`w-full text-left px-3 py-2 text-xs hover:bg-ink-800 first:rounded-t-lg last:rounded-b-lg ${language === l ? "text-primary-400 font-bold" : "text-white"}`}>
                {LANG_LABELS[l]}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* ═══ IDLE STATE ═══ */}
        {phase === "idle" && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/20 rounded-full blur-[60px] animate-pulse" />
              <motion.button onClick={startCall} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="relative w-32 h-32 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-2xl shadow-red-500/30 z-10">
                <Phone className="w-14 h-14 text-white" />
              </motion.button>
            </div>
            <div className="text-center max-w-xs">
              <h1 className="text-2xl font-display font-bold text-white mb-2">Voice Emergency</h1>
              <p className="text-sm text-ink-400 mb-6">Talk to JEEVAN AI directly in Hindi or Marathi. Tap the button to start the call.</p>
              <div className="flex items-center justify-center gap-4 text-xs text-ink-500">
                <span className="flex items-center gap-1"><Mic className="w-3.5 h-3.5" /> Real-time Speech</span>
                <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> Multilingual</span>
              </div>
            </div>
          </div>
        )}

        {/* ═══ RINGING STATE ═══ */}
        {phase === "ringing" && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8">
            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}
              className="w-32 h-32 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shadow-2xl shadow-green-500/30">
              <Phone className="w-14 h-14 text-white animate-bounce" />
            </motion.div>
            <div className="text-center">
              <p className="text-lg font-display font-bold text-white mb-1">Connecting...</p>
              <p className="text-sm text-ink-400">JEEVAN AI Emergency Helpline</p>
            </div>
            <button onClick={endCall} className="px-6 py-3 rounded-xl bg-red-600 text-white font-bold text-sm">Cancel</button>
          </div>
        )}

        {/* ═══ CONNECTED STATE ═══ */}
        {phase === "connected" && (
          <>
            {/* Call Status Bar */}
            <div className="px-4 py-2 bg-ink-900/80 border-b border-ink-800 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <span className="live-dot" style={{ background: "#22c55e", boxShadow: "0 0 6px rgba(34,197,94,0.6)" }} />
                <span className="text-xs font-mono text-green-400">LIVE</span>
                <span className="text-xs font-mono text-ink-400">{formatTime(callDuration)}</span>
                {isListening && !isMuted && (
                  <span className="text-[10px] text-primary-400 font-bold ml-2 animate-pulse flex items-center gap-1">
                    <Mic className="w-3 h-3" /> LISTENING...
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {emergencyType && (
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${sevColor}`}>
                    {emergencyType.replace("_", " ")}
                  </span>
                )}
                {landmark && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-ink-800 text-[10px] text-ink-300">
                    <MapPin className="w-3 h-3" /> {landmark}
                  </span>
                )}
                {ticketId && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-green-900/50 text-[10px] text-green-400">
                    <CheckCircle2 className="w-3 h-3" /> {ticketId}
                  </span>
                )}
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              <AnimatePresence>
                {messages.map(msg => (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                    className={`flex ${msg.role === "caller" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "caller"
                        ? "bg-primary-600 text-white rounded-br-md"
                        : "bg-ink-900 border border-ink-800 text-ink-200 rounded-bl-md"
                    }`}>
                      {msg.role === "agent" && <p className="text-[10px] text-primary-400 font-bold mb-1">JEEVAN AI</p>}
                      <p>{msg.text}</p>
                      <p className="text-[10px] mt-1 opacity-50">{msg.timestamp.toLocaleTimeString()}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="px-4 py-3 rounded-2xl bg-ink-900 border border-ink-800 rounded-bl-md">
                    <div className="flex gap-1">
                      {[0,1,2].map(i => (
                        <motion.div key={i} animate={{ y: [0,-6,0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                          className="w-2 h-2 rounded-full bg-primary-400" />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Text Input (Optional fallback) */}
            <div className="px-4 py-3 bg-ink-900/80 border-t border-ink-800 flex-shrink-0">
              <div className="flex items-center gap-2">
                <input value={inputText} onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSend(inputText)}
                  placeholder={language === "mr" ? "तुमची समस्या लिहा (किंवा बोला)..." : language === "en" ? "Type or speak your emergency..." : "अपनी समस्या लिखें (या बोलें)..."}
                  className="flex-1 bg-ink-800 border border-ink-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-ink-500 outline-none focus:border-primary-500/50" />
                <button onClick={() => handleSend(inputText)} disabled={!inputText.trim() || isProcessing}
                  className="w-10 h-10 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-30 flex items-center justify-center transition-colors">
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Call Controls */}
            <div className="px-4 py-4 bg-ink-950 border-t border-ink-800 flex items-center justify-center gap-6 flex-shrink-0">
              <button onClick={() => setIsMuted(!isMuted)}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isMuted ? "bg-red-600 shadow-lg shadow-red-600/20" : "bg-ink-800 hover:bg-ink-700"}`}>
                {isMuted ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-ink-300" />}
              </button>
              <button onClick={endCall}
                className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center shadow-lg shadow-red-600/30 transition-colors">
                <PhoneOff className="w-7 h-7 text-white" />
              </button>
              <button onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${!isSpeakerOn ? "bg-red-600" : "bg-ink-800 hover:bg-ink-700"}`}>
                {isSpeakerOn ? <Volume2 className="w-6 h-6 text-ink-300" /> : <VolumeX className="w-6 h-6 text-white" />}
              </button>
            </div>
          </>
        )}

        {/* ═══ ENDED STATE ═══ */}
        {phase === "ended" && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
            <div className="w-20 h-20 rounded-full bg-ink-900 border border-ink-800 flex items-center justify-center">
              <PhoneOff className="w-10 h-10 text-ink-400" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-display font-bold text-white mb-1">Call Ended</h2>
              <p className="text-sm text-ink-400">Duration: {formatTime(callDuration)}</p>
            </div>
            {ticketId && (
              <div className="w-full max-w-sm p-4 rounded-2xl bg-green-950/30 border border-green-800/50 text-center">
                <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-green-400">Emergency Ticket Created</p>
                <p className="text-xs text-green-400/70 font-mono mt-1">{ticketId}</p>
                {landmark && <p className="text-xs text-ink-400 mt-1 flex items-center justify-center gap-1"><MapPin className="w-3 h-3" /> {landmark}</p>}
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => { setPhase("idle"); setMessages([]); }}
                className="px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm transition-colors">
                New Call
              </button>
              <Link href="/emergency" className="px-6 py-3 rounded-xl bg-ink-800 hover:bg-ink-700 text-ink-300 font-bold text-sm transition-colors">
                Back
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
