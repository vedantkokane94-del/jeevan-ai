"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Play, X } from "lucide-react";

export function HeroVideoModal() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // The video file is loaded directly from the public folder
  const videoUrl = "/intro.mp4"; 

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center h-14 px-8 rounded-full border-2 border-ink-200 text-ink-600 font-display font-semibold text-lg hover:border-primary-400 hover:text-primary-700 transition-all gap-2 group"
      >
        <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-colors">
          <Play className="w-3 h-3 ml-0.5 fill-current" />
        </div>
        Watch Introduction
      </button>

      {mounted && isOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          {/* Dark backdrop */}
          <div 
            className="absolute inset-0 bg-ink-950/90 backdrop-blur-md cursor-pointer"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Video Container */}
          <div className="relative w-full max-w-4xl aspect-video max-h-[85vh] bg-black rounded-2xl overflow-hidden shadow-2xl shadow-primary-900/20 z-10 animate-scale-in">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur flex items-center justify-center rounded-full text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <video
              src={videoUrl}
              className="w-full h-full object-contain bg-black"
              controls
              autoPlay
              playsInline
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
