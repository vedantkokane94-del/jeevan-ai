"use client";

import React, { useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { Play, RotateCcw, AlertTriangle, ThermometerSun, Users, BarChart3, Activity, ArrowRight, Settings2, SlidersHorizontal, Layers } from "lucide-react";

const DynamicMap = dynamic(() => import("@jeevan-ai/ui").then((mod) => mod.Map), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-ink-900 skeleton">Loading Simulator Engine...</div>,
});

type Scenario = "baseline" | "crowd_surge" | "heatwave" | "road_closure";

export default function DigitalTwin() {
  const [scenario, setScenario] = useState<Scenario>("baseline");
  const [simulating, setSimulating] = useState(false);
  const [results, setResults] = useState<boolean>(false);
  
  // Simulation modifiers
  const [crowdMultiplier, setCrowdMultiplier] = useState(1.0);
  const [temperature, setTemperature] = useState(34);

  const defaultCenter: [number, number] = [20.0059, 73.7903]; // Nashik

  const handleSimulate = () => {
    setSimulating(true);
    setResults(false);
    setTimeout(() => {
      setSimulating(false);
      setResults(true);
    }, 2500);
  };

  const scenarios = [
    { id: "crowd_surge", icon: Users, title: "Crowd Surge", desc: "Simulate massive influx at Ram Ghat" },
    { id: "heatwave", icon: ThermometerSun, title: "Heatwave", desc: "Simulate extreme temperature impact on elderly" },
    { id: "road_closure", icon: AlertTriangle, title: "Arterial Closure", desc: "Simulate Dewas Road blockage and reroutes" },
  ];

  const generateMockHeatmapData = useCallback(() => {
    if (scenario !== "crowd_surge") return null;
    
    const centerLat = 20.0059;
    const centerLng = 73.7903;
    
    const features = [];
    const count = Math.floor(500 * crowdMultiplier);
    
    for (let i = 0; i < count; i++) {
      const u1 = Math.random();
      const u2 = Math.random();
      const z0 = Math.sqrt(-2.0 * Math.log(u1 || 0.001)) * Math.cos(2.0 * Math.PI * u2);
      const z1 = Math.sqrt(-2.0 * Math.log(u1 || 0.001)) * Math.sin(2.0 * Math.PI * u2);
      
      const latOffset = (z0 * 0.015);
      const lngOffset = (z1 * 0.015);
      
      const distance = Math.sqrt(latOffset*latOffset + lngOffset*lngOffset);
      const density = Math.max(10, 100 - (distance * 4000));
      
      features.push({
        type: "Feature",
        properties: { density },
        geometry: {
          type: "Point",
          coordinates: [centerLng + lngOffset, centerLat + latOffset]
        }
      });
    }
    
    return {
      type: "FeatureCollection",
      features
    };
  }, [scenario, crowdMultiplier]);

  const heatmapData = useMemo(() => results ? generateMockHeatmapData() : null, [results, generateMockHeatmapData]);

  return (
    <div className="flex-1 flex h-[100dvh] overflow-hidden relative" data-theme="ink">
      
      {/* Simulation Controls Sidebar */}
      <div className="w-80 lg:w-96 flex flex-col bg-ink-950 border-r border-ink-800 shrink-0 z-10 shadow-2xl relative">
        <div className="p-5 border-b border-ink-800 bg-ink-950">
          <h2 className="text-sm font-display font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary-500" /> Digital Twin Engine
          </h2>
          <p className="text-[10px] text-ink-400 font-mono mt-1 leading-relaxed">Adjust parameters and run predictive simulations to stress-test Kumbh operations.</p>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6 no-scrollbar">
          
          {/* Scenario Selection */}
          <div>
            <h3 className="text-[10px] font-bold text-ink-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Settings2 className="w-3 h-3" /> Select Base Scenario
            </h3>
            <div className="space-y-2">
              {scenarios.map(s => (
                <button 
                  key={s.id}
                  onClick={() => { setScenario(s.id as Scenario); setResults(false); }}
                  className={`w-full card-elevated p-3 text-left border transition-all ${scenario === s.id ? "border-primary-500 bg-primary-950/20 shadow-glow-primary" : "border-ink-800 bg-ink-900 hover:border-ink-600"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${scenario === s.id ? "bg-primary-600 text-white" : "bg-ink-800 text-ink-400"}`}>
                      <s.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className={`font-bold text-sm ${scenario === s.id ? "text-white" : "text-ink-200"}`}>{s.title}</h3>
                      <p className="text-[10px] text-ink-400 font-mono mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Modifiers (Sliders) */}
          <div className="pt-4 border-t border-ink-800">
             <h3 className="text-[10px] font-bold text-ink-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <SlidersHorizontal className="w-3 h-3" /> Environmental Modifiers
            </h3>
            
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-ink-300 font-semibold">Crowd Multiplier</span>
                  <span className="text-primary-400 font-mono font-bold">x{crowdMultiplier.toFixed(1)}</span>
                </div>
                <input 
                  type="range" 
                  min="0.5" max="3.0" step="0.1" 
                  value={crowdMultiplier}
                  onChange={(e) => { setCrowdMultiplier(parseFloat(e.target.value)); setResults(false); }}
                  className="w-full accent-primary-500"
                />
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-ink-300 font-semibold">Temperature (°C)</span>
                  <span className={`font-mono font-bold ${temperature > 40 ? "text-alert-500" : temperature > 35 ? "text-accent-500" : "text-primary-400"}`}>{temperature}°C</span>
                </div>
                <input 
                  type="range" 
                  min="20" max="50" step="1" 
                  value={temperature}
                  onChange={(e) => { setTemperature(parseInt(e.target.value)); setResults(false); }}
                  className="w-full accent-accent-500"
                />
              </div>
            </div>
          </div>

        </div>

        <div className="p-5 border-t border-ink-800 bg-ink-950 shrink-0">
          <button 
            onClick={handleSimulate}
            disabled={simulating}
            className={`w-full h-12 rounded-xl text-white font-bold tracking-wide flex items-center justify-center gap-2 transition-all shadow-lg ${simulating ? "bg-primary-800 cursor-wait" : "bg-primary-600 hover:bg-primary-500 shadow-primary-600/20"}`}
          >
            {simulating ? (
              <><span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> RUNNING SIMULATION...</>
            ) : (
              <><Play className="w-4 h-4 fill-current" /> EXECUTE SCENARIO</>
            )}
          </button>
          
          <button 
            onClick={() => { setScenario("baseline"); setCrowdMultiplier(1.0); setTemperature(34); setResults(false); }}
            className="w-full h-10 mt-3 rounded-lg text-ink-400 text-xs font-semibold hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset to Live Baseline
          </button>
        </div>
      </div>

      {/* Main Simulation View */}
      <div className="flex-1 flex flex-col relative bg-ink-900">
        
        {/* Map Layer */}
        <div className="absolute inset-0 grayscale invert contrast-125 hue-rotate-180 brightness-[0.7] saturate-50">
          <DynamicMap center={defaultCenter} zoom={14} className="h-full w-full" heatmapData={heatmapData} />
        </div>

        {/* Visual Overlay for Road Closure */}
        {results && scenario === "road_closure" && (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-alert-500/30 via-transparent to-transparent mix-blend-screen animate-fade-in pointer-events-none" />
        )}
        
        {/* Visual Overlay for Heatwave */}
        {results && temperature >= 40 && (
          <div className="absolute inset-0 bg-accent-500/10 mix-blend-screen animate-fade-in pointer-events-none" />
        )}

        {/* Results Panel */}
        {results && (
          <div className="absolute top-4 right-4 w-[340px] card-elevated bg-ink-950/95 backdrop-blur border-ink-800 shadow-2xl p-5 animate-slide-in-bottom">
            <h3 className="text-sm font-display font-bold text-white mb-4 flex items-center justify-between border-b border-ink-800 pb-3">
              <span className="flex items-center gap-2"><BarChart3 className="w-4 h-4 text-primary-500" /> Impact Analysis</span>
              <span className="text-[10px] font-mono text-ink-400 bg-ink-900 px-2 py-0.5 rounded">T+15 MINS</span>
            </h3>
            
            <div className="space-y-5">
              <div>
                <p className="text-[10px] font-mono text-ink-400 mb-1 flex justify-between"><span>MEDICAL INCIDENTS</span> <span className="text-alert-400 font-bold">+{Math.floor(crowdMultiplier * (temperature > 38 ? 45 : 12))}%</span></p>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 bg-ink-800 rounded-full overflow-hidden">
                    <div className="h-full bg-ink-500 w-1/3" />
                  </div>
                  <ArrowRight className="w-3 h-3 text-ink-600" />
                  <div className="h-1.5 flex-1 bg-ink-800 rounded-full overflow-hidden">
                    <div className="h-full bg-alert-500 w-[78%] shadow-glow-alert" />
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-mono text-ink-400 mb-1 flex justify-between"><span>AMBULANCE RESPONSE ETA</span> <span className="text-alert-400 font-bold">{scenario === "road_closure" ? "+14m" : "+4m"}</span></p>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 bg-ink-800 rounded-full overflow-hidden">
                    <div className="h-full bg-ink-500 w-1/4" />
                  </div>
                  <ArrowRight className="w-3 h-3 text-ink-600" />
                  <div className="h-1.5 flex-1 bg-ink-800 rounded-full overflow-hidden">
                    <div className={`h-full w-[85%] ${scenario === "road_closure" ? "bg-alert-500 shadow-glow-alert" : "bg-accent-500"}`} />
                  </div>
                </div>
              </div>
              
              <div>
                <p className="text-[10px] font-mono text-ink-400 mb-1 flex justify-between"><span>CROWD DENSITY (RAMKUND)</span> <span className="text-primary-400 font-bold">{Math.floor(4.2 * crowdMultiplier)} pax/m²</span></p>
                <div className="h-1.5 w-full bg-ink-800 rounded-full overflow-hidden">
                  <div className={`h-full ${crowdMultiplier > 1.5 ? "bg-alert-500 shadow-glow-alert" : "bg-primary-500"}`} style={{ width: `${Math.min(100, (4.2 * crowdMultiplier / 6) * 100)}%` }} />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-ink-800 bg-alert-950/20 -mx-5 px-5 -mb-5 pb-5 rounded-b-xl border-t-alert-900/50">
              <p className="text-[10px] font-mono text-alert-400 mb-2 font-bold flex items-center gap-1.5"><Activity className="w-3 h-3" /> AI MITIGATION PLAN</p>
              <ul className="text-xs text-ink-200 space-y-1.5 list-disc pl-3">
                {scenario === "road_closure" && <li>Reroute AMB-04 and AMB-12 via Gangapur Road.</li>}
                {temperature >= 40 && <li>Deploy 5 mobile hydration units to Sector B.</li>}
                {crowdMultiplier > 1.5 && <li>Halt entry at Gate 4; divert foot traffic to Godavari bridge.</li>}
                <li>Pre-emptively alert Civil Hospital for mass casualty protocol.</li>
              </ul>
              <button className="w-full h-8 mt-4 rounded border border-alert-800 text-alert-400 text-[10px] font-bold hover:bg-alert-900 transition-colors">
                BROADCAST PROTOCOL TO UNITS
              </button>
            </div>
          </div>
        )}

        {/* State Indicator */}
        <div className="absolute top-4 left-4 z-10 px-3 py-1.5 bg-ink-950/90 backdrop-blur border border-ink-800 rounded-lg flex items-center gap-2 shadow-lg">
          {simulating ? (
            <><span className="w-2 h-2 rounded-full bg-accent-500 animate-ping" /> <span className="text-[10px] font-mono text-accent-400 font-bold">COMPUTING</span></>
          ) : results ? (
            <><span className="w-2 h-2 rounded-full bg-alert-500 animate-pulse" /> <span className="text-[10px] font-mono text-alert-400 font-bold">SIMULATION ACTIVE</span></>
          ) : (
            <><span className="w-2 h-2 rounded-full bg-primary-500" /> <span className="text-[10px] font-mono text-primary-400 font-bold">BASELINE</span></>
          )}
        </div>
      </div>

    </div>
  );
}
