"use client";

import React, { useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";

export interface SOSButtonProps {
  onTrigger: (latitude: number, longitude: number) => Promise<void>;
  className?: string;
}

export function SOSButton({ onTrigger, className = "" }: SOSButtonProps) {
  const [status, setStatus] = useState<"IDLE" | "LOCATING" | "SENDING" | "SENT" | "ERROR">("IDLE");
  const [errorMessage, setErrorMessage] = useState("");

  const handlePress = () => {
    if (status === "LOCATING" || status === "SENDING") return;
    
    setStatus("LOCATING");
    setErrorMessage("");

    if (!navigator.geolocation) {
      setStatus("ERROR");
      setErrorMessage("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          setStatus("SENDING");
          await onTrigger(position.coords.latitude, position.coords.longitude);
          setStatus("SENT");
          setTimeout(() => setStatus("IDLE"), 5000);
        } catch (error) {
          setStatus("ERROR");
          setErrorMessage("Failed to send SOS. Please try again.");
          setTimeout(() => setStatus("IDLE"), 5000);
        }
      },
      (error) => {
        setStatus("ERROR");
        setErrorMessage("Unable to retrieve your location.");
        setTimeout(() => setStatus("IDLE"), 5000);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // SRS requires minimum 88px touch target for emergency actions
  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      <button
        onClick={handlePress}
        disabled={status === "LOCATING" || status === "SENDING" || status === "SENT"}
        className={`
          relative flex items-center justify-center
          min-h-[88px] min-w-[200px] w-full
          rounded-2xl font-display font-bold text-2xl uppercase tracking-wider
          transition-all duration-200 transform active:scale-95 shadow-lg
          ${status === "IDLE" ? "bg-alert-500 hover:bg-alert-600 text-white animate-pulse" : ""}
          ${(status === "LOCATING" || status === "SENDING") ? "bg-alert-400 text-white cursor-wait" : ""}
          ${status === "SENT" ? "bg-primary-500 text-white" : ""}
          ${status === "ERROR" ? "bg-red-700 text-white" : ""}
        `}
      >
        <span className="flex items-center gap-2">
          {status === "IDLE" && (
            <>
              <AlertTriangle size={28} />
              SOS
            </>
          )}
          {status === "LOCATING" && (
            <>
              <Loader2 className="animate-spin" size={28} />
              LOCATING...
            </>
          )}
          {status === "SENDING" && (
            <>
              <Loader2 className="animate-spin" size={28} />
              SENDING...
            </>
          )}
          {status === "SENT" && "HELP IS ON THE WAY"}
          {status === "ERROR" && "RETRY SOS"}
        </span>
      </button>
      
      {status === "ERROR" && (
        <span className="text-alert-500 text-sm font-semibold text-center mt-2">
          {errorMessage}
        </span>
      )}
      
      {status === "IDLE" && (
        <span className="text-ink-500 text-xs text-center">
          Only use in a critical emergency.
        </span>
      )}
    </div>
  );
}
