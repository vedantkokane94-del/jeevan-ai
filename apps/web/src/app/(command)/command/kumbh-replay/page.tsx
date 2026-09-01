"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { History, Play, Pause, FastForward, SkipBack, Calendar, Clock, Database, Download } from "lucide-react";

const DynamicMap = dynamic(() => import("@jeevan-ai/ui").then((mod) => mod.Map), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-ink-900 skeleton">Loading Replay Engine...</div>,
});

export default function KumbhReplay() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1);
  const defaultCenter: [number, number] = [20.0059, 73.7903]; // Nashik

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return p + (0.5 * speed);
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, speed]);

  const formatTime = (p: number) => {
    // Map 0-100 to 00:00 to 24:00
    const totalMinutes = Math.floor((p / 100) * 24 * 60);
    const hours = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
    const minutes = (totalMinutes % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <div className="flex-1 flex flex-col h-[100dvh] overflow-hidden relative" data-theme="ink">
      
      {/* Top Bar */}
      <header className="h-16 bg-ink-950 border-b border-ink-800 flex items-center justify-between px-6 shrink-0 z-20 shadow-lg">
        <div className="flex items-center gap-4">
          <h1 className="font-display font-bold text-white tracking-widest text-lg flex items-center gap-2">
            <History className="w-5 h-5 text-primary-500" /> KUMBH REPLAY
          </h1>
          <div className="h-6 w-px bg-ink-800" />
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-ink-900 border border-ink-800">
            <Calendar className="w-3.5 h-3.5 text-ink-400" />
            <span className="text-xs font-mono text-ink-200">14 AUG 2027 (MAHI SNAN)</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="h-9 px-4 rounded-lg bg-ink-900 border border-ink-800 text-ink-300 text-xs font-bold hover:text-white transition-colors flex items-center gap-2">
            <Database className="w-3.5 h-3.5" /> LOAD ARCHIVE
          </button>
          <button className="h-9 px-4 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold transition-colors flex items-center gap-2 shadow-sm shadow-primary-600/20">
            <Download className="w-3.5 h-3.5" /> EXPORT LOG
          </button>
        </div>
      </header>

      {/* Main Map View */}
      <div className="flex-1 flex flex-col relative bg-ink-900">
        
        {/* Map Layer */}
        <div className="absolute inset-0 grayscale invert contrast-125 hue-rotate-180 brightness-[0.6] saturate-50">
          <DynamicMap center={defaultCenter} zoom={13.5} className="h-full w-full" />
        </div>

        {/* Mock Heatmap changes based on progress */}
        <div className="absolute inset-0 pointer-events-none z-10 opacity-60 mix-blend-screen transition-opacity duration-1000" 
             style={{
               background: progress > 30 && progress < 70 
                 ? "radial-gradient(circle at 50% 50%, rgba(220,38,38,0.4) 0%, transparent 60%)" 
                 : "radial-gradient(circle at 50% 50%, rgba(37,99,235,0.4) 0%, transparent 40%)"
             }} 
        />

        {/* Timeline Controls - Bottom */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[800px] max-w-[95vw] card-elevated bg-ink-950/90 backdrop-blur border-ink-800 p-5 z-20 shadow-2xl rounded-2xl">
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => { setProgress(0); setIsPlaying(false); }}
                className="w-10 h-10 rounded-full bg-ink-900 border border-ink-700 flex items-center justify-center text-ink-300 hover:text-white transition-colors"
              >
                <SkipBack className="w-4 h-4 fill-current" />
              </button>
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-14 h-14 rounded-full bg-primary-600 text-white flex items-center justify-center hover:scale-105 transition-transform shadow-glow-primary"
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
              </button>
              <button 
                onClick={() => setSpeed(s => s >= 8 ? 1 : s * 2)}
                className="w-10 h-10 rounded-full bg-ink-900 border border-ink-700 flex items-center justify-center text-ink-300 hover:text-white font-mono text-xs font-bold transition-colors"
              >
                {speed}x
              </button>
            </div>
            
            <div className="text-center font-mono">
              <div className="text-2xl font-bold text-white tracking-widest">{formatTime(progress)}</div>
              <div className="text-[10px] text-ink-400 mt-1 flex items-center justify-center gap-1"><Clock className="w-3 h-3" /> SIMULATED TIME</div>
            </div>
          </div>

          {/* Scrubber */}
          <div className="relative w-full h-12 flex flex-col justify-center cursor-pointer" onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            setProgress((x / rect.width) * 100);
          }}>
            <div className="w-full h-2 bg-ink-900 rounded-full overflow-hidden border border-ink-800">
              <div className="h-full bg-primary-500 relative" style={{ width: `${progress}%` }}>
                <div className="absolute right-0 top-0 bottom-0 w-2 bg-white shadow-[0_0_10px_rgba(255,255,255,1)]" />
              </div>
            </div>
            
            {/* Timeline markers */}
            <div className="absolute inset-0 flex items-center pointer-events-none px-1">
              {[0, 25, 50, 75, 100].map((mark) => (
                <div key={mark} className="absolute h-4 w-px bg-ink-700" style={{ left: `${mark}%` }}>
                  <span className="absolute top-5 -translate-x-1/2 text-[9px] font-mono text-ink-500">{formatTime(mark)}</span>
                </div>
              ))}
            </div>
            
            {/* Incident Markers */}
            <div className="absolute h-2 w-2 rounded-full bg-alert-500 shadow-glow-alert" style={{ left: '42%', top: 'calc(50% - 4px)' }} title="Stampede Alert" />
            <div className="absolute h-2 w-2 rounded-full bg-accent-500 shadow-glow-accent" style={{ left: '68%', top: 'calc(50% - 4px)' }} title="Bridge Closure" />
          </div>

        </div>
        
        {/* Event Log sidebar */}
        <div className="absolute top-4 right-4 w-72 max-h-[60vh] flex flex-col card-elevated bg-ink-950/90 backdrop-blur border-ink-800 z-20">
          <div className="p-3 border-b border-ink-800 bg-ink-950 shrink-0">
            <h3 className="text-[10px] font-bold text-ink-500 uppercase tracking-widest">Historical Event Log</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar font-mono">
            {progress > 10 && (
              <div className="text-[10px] p-2 bg-ink-900 border border-ink-800 rounded animate-fade-in-down">
                <span className="text-primary-500 block mb-0.5">02:24</span>
                <span className="text-ink-300">Gates 1-4 opened for early morning snan.</span>
              </div>
            )}
            {progress > 42 && (
              <div className="text-[10px] p-2 bg-alert-950/30 border border-alert-900/50 rounded animate-fade-in-down">
                <span className="text-alert-400 block mb-0.5 font-bold">10:04</span>
                <span className="text-ink-200">Density alert at Ramkund. AI triggers route diversion protocol.</span>
              </div>
            )}
            {progress > 68 && (
              <div className="text-[10px] p-2 bg-accent-950/30 border border-accent-900/50 rounded animate-fade-in-down">
                <span className="text-accent-400 block mb-0.5 font-bold">16:19</span>
                <span className="text-ink-200">Godavari Bridge closed temporarily due to structural capacity warnings.</span>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
