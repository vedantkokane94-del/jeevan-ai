/* eslint-disable */
"use client";

import * as React from "react";
import MapGL, { Marker, NavigationControl, FullscreenControl, Source, Layer } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import type { LayerProps } from "react-map-gl/maplibre";

export interface MapPoint {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  category?: "hospital" | "camp" | "zone" | "parking" | "police" | "transit";
}

export interface MapProps {
  center: [number, number]; // [lat, lng]
  zoom?: number;
  points?: MapPoint[];
  onPointClick?: (id: string) => void;
  className?: string;
  theme?: "light" | "dark" | "satellite";
  heatmapData?: any; // GeoJSON FeatureCollection
  showAmbulanceRoute?: boolean;
  routePath?: [number, number][]; // Array of [lat, lng]
  ambulanceTitle?: string;
  destinationTitle?: string;
}

// 3D ESRI Satellite style configuration
const satelliteStyle: any = {
  version: 8,
  sources: {
    "esri-satellite-source": {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      ],
      tileSize: 256,
      attribution: "Esri, Maxar, Earthstar Geographics"
    }
  },
  layers: [
    {
      id: "esri-satellite-layer",
      type: "raster",
      source: "esri-satellite-source",
      minzoom: 0,
      maxzoom: 20
    }
  ]
};

// Central Emergency Incident Spot (Ramkund Holy Snan Ghat)
const EMERGENCY_SPOT: [number, number] = [20.0063, 73.7925]; // [lat, lng]

// Default emergency route in Nashik Kumbh area based on Google Maps GPS (Civil Hospital to Ramkund Ghat)
const DEFAULT_ROUTE: [number, number][] = [
  [20.0020, 73.7785], // Civil Hospital Nashik (Google Maps Reference)
  [20.0035, 73.7820], // CBS Signal / Trimbak Road Junction
  [20.0048, 73.7860], // Ashok Stambh / Panchavati Bridge Approach
  [20.0055, 73.7890], // Godavari River Bridge Corridor
  [20.0062, 73.7915], // Malviya Chowk Panchavati
  [20.0063, 73.7925], // Ramkund Holy Snan Ghat Emergency Point
];

// 5 Nearest Hospital Emergency Routes ALL CONNECTED to central Emergency Point [73.7925, 20.0063]
const CONNECTED_HOSPITAL_ROUTES = [
  {
    id: "route-civil",
    name: "Civil Hospital Emergency Corridor",
    color: "#0ea5e9", // Cyan
    destName: "Civil Hospital Nashik",
    destCoords: [73.7785, 20.0020] as [number, number],
    coords: [
      [73.7925, 20.0063], // Central Emergency Point (Ramkund)
      [73.7890, 20.0055], // Panchavati Bridge
      [73.7860, 20.0048], // Ashok Stambh
      [73.7820, 20.0035], // CBS Signal
      [73.7785, 20.0020], // Civil Hospital Nashik
    ]
  },
  {
    id: "route-apollo",
    name: "Apollo Hospital Panchavati Corridor",
    color: "#a855f7", // Purple
    destName: "Apollo Hospital Panchavati",
    destCoords: [73.7980, 20.0125] as [number, number],
    coords: [
      [73.7925, 20.0063], // Central Emergency Point (Ramkund)
      [73.7945, 20.0078], // Kalaram Mandir Chowk
      [73.7960, 20.0100], // Panchavati Circle
      [73.7980, 20.0125], // Apollo Hospitals Panchavati
    ]
  },
  {
    id: "route-district",
    name: "District Hospital CBS Corridor",
    color: "#10b981", // Emerald
    destName: "District Hospital CBS",
    destCoords: [73.7852, 19.9975] as [number, number],
    coords: [
      [73.7925, 20.0063], // Central Emergency Point (Ramkund)
      [73.7915, 20.0055], // Godavari Main Ghat Exit
      [73.7880, 20.0010], // Victoria Bridge
      [73.7852, 19.9975], // District Hospital CBS
    ]
  },
  {
    id: "route-sahyadri",
    name: "Sahyadri Hospital Wadala Corridor",
    color: "#f97316", // Orange
    destName: "Sahyadri Hospital Wadala",
    destCoords: [73.7910, 19.9880] as [number, number],
    coords: [
      [73.7925, 20.0063], // Central Emergency Point (Ramkund)
      [73.8048, 20.0012], // Tapovan Road
      [73.7980, 19.9930], // Dwarka Circle
      [73.7910, 19.9880], // Sahyadri Hospital Wadala
    ]
  },
  {
    id: "route-wockhardt",
    name: "Wockhardt Trauma Center Corridor",
    color: "#f59e0b", // Amber
    destName: "Wockhardt Hospital Trauma Center",
    destCoords: [73.7750, 19.9720] as [number, number],
    coords: [
      [73.7925, 20.0063], // Central Emergency Point (Ramkund)
      [73.7845, 19.9980], // CBS Flyover
      [73.7800, 19.9780], // Mumbai Naka
      [73.7750, 19.9720], // Wockhardt Hospital Trauma Center
    ]
  }
];

const routeGlowLayer: LayerProps = {
  id: "emergency-route-glow",
  type: "line",
  source: "emergency-route-source",
  layout: {
    "line-join": "round",
    "line-cap": "round"
  },
  paint: {
    "line-color": "#0ea5e9",
    "line-width": 14,
    "line-opacity": 0.45,
    "line-blur": 6
  }
};

const routeCoreLayer: LayerProps = {
  id: "emergency-route-core",
  type: "line",
  source: "emergency-route-source",
  layout: {
    "line-join": "round",
    "line-cap": "round"
  },
  paint: {
    "line-color": "#38bdf8",
    "line-width": 5
  }
};

const routePulseLayer: LayerProps = {
  id: "emergency-route-pulse",
  type: "line",
  source: "emergency-route-source",
  layout: {
    "line-join": "round",
    "line-cap": "round"
  },
  paint: {
    "line-color": "#ffffff",
    "line-width": 2,
    "line-dasharray": [2, 4]
  }
};

const heatmapLayer: LayerProps = {
  id: "crowd-heat",
  type: "heatmap",
  source: "crowd-heat-source",
  maxzoom: 18,
  paint: {
    "heatmap-weight": ["interpolate", ["linear"], ["get", "density"], 0, 0, 100, 1],
    "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 11, 1, 18, 3],
    "heatmap-color": [
      "interpolate",
      ["linear"],
      ["heatmap-density"],
      0, "rgba(0,0,0,0)",
      0.2, "rgba(234,179,8,0.2)",
      0.4, "rgba(249,115,22,0.4)",
      0.6, "rgba(239,68,68,0.6)",
      0.8, "rgba(220,38,38,0.8)",
      1, "rgba(153,27,27,1)"
    ],
    "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 11, 15, 18, 40],
    "heatmap-opacity": ["interpolate", ["linear"], ["zoom"], 14, 0.9, 18, 0.4]
  }
};

export function Map({
  center,
  zoom = 14,
  points = [],
  onPointClick,
  className = "",
  theme: initialTheme = "satellite",
  heatmapData = null,
  showAmbulanceRoute = true,
  routePath = DEFAULT_ROUTE,
  ambulanceTitle = "AMB-08 (Live)",
  destinationTitle = "Ramkund Emergency Point",
}: MapProps) {
  const [activeTheme, setActiveTheme] = React.useState<"satellite" | "dark" | "light">(initialTheme);

  // Map Style Map
  const mapStyle = activeTheme === "satellite"
    ? satelliteStyle
    : activeTheme === "dark"
    ? "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
    : "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

  // Moving Ambulance Interpolation State
  const activeRoute = routePath && routePath.length > 1 ? routePath : DEFAULT_ROUTE;
  const [currentSegmentIndex, setCurrentSegmentIndex] = React.useState(0);
  const [progress, setProgress] = React.useState(0);
  const [ambulancePos, setAmbulancePos] = React.useState<[number, number]>(activeRoute[0]);
  const [heading, setHeading] = React.useState(0);

  // Animation Loop for Moving Ambulance along Shortest Route (Slower & Smoother)
  React.useEffect(() => {
    if (!showAmbulanceRoute || activeRoute.length < 2) return;

    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        const nextProgress = prevProgress + 0.008; // Slower speed (approx 22 km/h simulation)
        if (nextProgress >= 1) {
          setCurrentSegmentIndex((prevSeg) => (prevSeg + 1) % (activeRoute.length - 1));
          return 0;
        }
        return nextProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [showAmbulanceRoute, activeRoute]);

  // Compute interpolated position and rotation heading
  React.useEffect(() => {
    if (!showAmbulanceRoute || activeRoute.length < 2) return;

    const start = activeRoute[currentSegmentIndex];
    const end = activeRoute[(currentSegmentIndex + 1) % activeRoute.length];

    const lat = start[0] + (end[0] - start[0]) * progress;
    const lng = start[1] + (end[1] - start[1]) * progress;
    setAmbulancePos([lat, lng]);

    // Calculate heading angle
    const dLat = end[0] - start[0];
    const dLng = end[1] - start[1];
    const angle = (Math.atan2(dLng, dLat) * 180) / Math.PI;
    setHeading(angle);
  }, [currentSegmentIndex, progress, activeRoute, showAmbulanceRoute]);

  const handleMarkerClick = (e: any, pointId: string) => {
    if (e?.originalEvent) e.originalEvent.stopPropagation();
    if (onPointClick) onPointClick(pointId);
  };

  // GeoJSON LineString for Primary Active Route Corridor
  const routeGeoJSON: any = {
    type: "Feature",
    properties: {},
    geometry: {
      type: "LineString",
      coordinates: activeRoute.map(([lat, lng]) => [lng, lat]) // MapLibre uses [lng, lat]
    }
  };

  return (
    <div className={`w-full h-full relative z-0 rounded-xl overflow-hidden shadow-2xl ${className}`}>
      {/* 3D Map Viewport */}
      <MapGL
        initialViewState={{
          longitude: center[1],
          latitude: center[0],
          zoom: zoom,
          pitch: 62, // 3D Satellite Tilt
          bearing: -18 // 3D Perspective Rotation
        }}
        mapStyle={mapStyle}
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="bottom-right" />
        <FullscreenControl position="bottom-right" />

        {/* Dynamic Crowd Density Heatmap Layer */}
        {heatmapData && (
          <Source id="crowd-heat-source" type="geojson" data={heatmapData}>
            <Layer {...heatmapLayer} />
          </Source>
        )}

        {/* 5 Nearest Hospital Emergency Routes ALL Connected to Ramkund Emergency Point */}
        {showAmbulanceRoute && CONNECTED_HOSPITAL_ROUTES.map(hr => (
          <Source key={hr.id} id={`${hr.id}-source`} type="geojson" data={{
            type: "Feature",
            properties: {},
            geometry: { type: "LineString", coordinates: hr.coords }
          }}>
            <Layer
              id={`${hr.id}-layer`}
              type="line"
              layout={{ "line-join": "round", "line-cap": "round" }}
              paint={{
                "line-color": hr.color,
                "line-width": 4,
                "line-opacity": 0.9
              }}
            />
          </Source>
        ))}

        {/* Shortest Primary Active Corridor */}
        {showAmbulanceRoute && (
          <Source id="emergency-route-source" type="geojson" data={routeGeoJSON}>
            <Layer {...routeGlowLayer} />
            <Layer {...routeCoreLayer} />
            <Layer {...routePulseLayer} />
          </Source>
        )}

        {/* 5 Connected Hospital Destination Markers */}
        {showAmbulanceRoute && CONNECTED_HOSPITAL_ROUTES.map(hr => (
          <Marker key={`dest-${hr.id}`} longitude={hr.destCoords[0]} latitude={hr.destCoords[1]} anchor="bottom">
            <div className="flex flex-col items-center">
              <div 
                className="px-2.5 py-1 rounded-md text-white text-[10px] font-bold shadow-lg mb-1 flex items-center gap-1 backdrop-blur"
                style={{ backgroundColor: hr.color }}
              >
                <span>🏥</span> {hr.destName}
              </div>
              <div className="w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center shadow-md" style={{ backgroundColor: hr.color }} />
            </div>
          </Marker>
        ))}

        {/* CENTRAL ACTIVE EMERGENCY POINT MARKER */}
        {showAmbulanceRoute && (
          <Marker longitude={EMERGENCY_SPOT[1]} latitude={EMERGENCY_SPOT[0]} anchor="bottom">
            <div className="flex flex-col items-center z-20">
              <div className="px-3 py-1.5 rounded-xl bg-alert-600 border-2 border-white text-white text-xs font-bold shadow-2xl shadow-alert-600/60 mb-1 flex items-center gap-1.5 animate-bounce">
                <span className="live-dot-alert" style={{ width: 8, height: 8 }} />
                <span>🚨 EMERGENCY POINT (Ramkund Ghat)</span>
              </div>
              <div className="w-6 h-6 rounded-full bg-alert-600 border-2 border-white flex items-center justify-center shadow-glow-alert animate-ping" />
            </div>
          </Marker>
        )}

        {/* Points of Interest / Incidents */}
        {points.map((point) => (
          <Marker
            key={point.id}
            longitude={point.longitude}
            latitude={point.latitude}
            anchor="bottom"
            onClick={(e: any) => handleMarkerClick(e, point.id)}
          >
            <div className={`w-6 h-6 rounded-full border-2 border-white shadow-glow-primary flex items-center justify-center cursor-pointer transition-transform hover:scale-110
              ${point.severity === "CRITICAL" ? "bg-alert-500 animate-pulse shadow-glow-alert" : 
                point.severity === "HIGH" ? "bg-accent-500" : 
                point.severity === "MEDIUM" ? "bg-primary-500" : "bg-success-500"}`}
            >
               <div className="w-2 h-2 bg-white rounded-full" />
            </div>
            <div className="absolute top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-ink-950/90 border border-ink-800 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg backdrop-blur">
              {point.title}
            </div>
          </Marker>
        ))}

        {/* LIVE MOVING AMBULANCE MARKER (ATTRACTIVE & STRAIGHT) */}
        {showAmbulanceRoute && (
          <Marker longitude={ambulancePos[1]} latitude={ambulancePos[0]} anchor="center">
            <div className="relative group flex flex-col items-center cursor-pointer">
              {/* Floating Live Badge & Speed */}
              <div className="absolute -top-11 whitespace-nowrap px-3 py-1 rounded-xl bg-ink-950/95 border border-alert-500/60 text-white text-[11px] font-bold shadow-2xl flex items-center gap-2 backdrop-blur animate-bounce z-30">
                <span className="live-dot-alert" style={{ width: 7, height: 7 }} />
                <span className="text-white tracking-wide">{ambulanceTitle}</span>
                <span className="px-1.5 py-0.5 rounded bg-primary-600/30 text-primary-300 font-mono text-[10px]">22 km/h</span>
              </div>

              {/* Attractive Vehicle Icon Capsule - Straight Upright */}
              <div className="relative flex items-center justify-center z-20">
                {/* Flashing Dual Red/Blue Emergency Sirens */}
                <div className="absolute -top-2 flex gap-2 z-30">
                  <span className="w-2.5 h-2.5 rounded-full bg-alert-500 animate-ping shadow-[0_0_10px_#ef4444]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping shadow-[0_0_10px_#38bdf8]" style={{ animationDelay: "200ms" }} />
                </div>

                {/* Main Vehicle Badge Container */}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-ink-950 via-primary-950 to-alert-950 border-2 border-white text-white flex items-center justify-center shadow-[0_0_35px_rgba(14,165,233,0.8)] relative overflow-hidden group-hover:scale-110 transition-transform">
                  <div className="absolute inset-0 bg-primary-600/20 mix-blend-overlay" />
                  
                  {/* Detailed Ambulance Vector SVG */}
                  <svg className="w-8 h-8 text-white drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                    <path d="M19 18h2a1 1 0 0 0 1-1v-3.28a1 1 0 0 0-.3-.7l-2.43-2.43a1 1 0 0 0-.71-.29H14" />
                    <circle cx="7" cy="18" r="2" fill="#ef4444" stroke="white" strokeWidth="1.5" />
                    <circle cx="17" cy="18" r="2" fill="#ef4444" stroke="white" strokeWidth="1.5" />
                    <path d="M8 8h3" stroke="#ef4444" strokeWidth="2.5" />
                    <path d="M9.5 6.5v3" stroke="#ef4444" strokeWidth="2.5" />
                  </svg>
                </div>

                {/* Outer Glow Pulse Rings */}
                <span className="absolute -inset-2 rounded-2xl border-2 border-primary-400/80 opacity-75 animate-ping pointer-events-none" />
                <span className="absolute -inset-4 rounded-3xl border border-alert-500/50 opacity-40 animate-pulse pointer-events-none" />
              </div>
            </div>
          </Marker>
        )}
      </MapGL>

      {/* 3D Map Mode Control Bar */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 p-1 rounded-xl bg-ink-950/80 backdrop-blur border border-ink-800 shadow-xl">
        <button
          onClick={() => setActiveTheme("satellite")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTheme === "satellite"
              ? "bg-primary-600 text-white shadow-md"
              : "text-ink-300 hover:text-white hover:bg-ink-900"
          }`}
        >
          <span>🛰️</span> 3D Satellite
        </button>
        <button
          onClick={() => setActiveTheme("dark")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTheme === "dark"
              ? "bg-primary-600 text-white shadow-md"
              : "text-ink-300 hover:text-white hover:bg-ink-900"
          }`}
        >
          <span>🌙</span> 3D Dark
        </button>
        <button
          onClick={() => setActiveTheme("light")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTheme === "light"
              ? "bg-primary-600 text-white shadow-md"
              : "text-ink-300 hover:text-white hover:bg-ink-900"
          }`}
        >
          <span>☀️</span> 3D Light
        </button>
      </div>

      {/* Emergency Shortest Route Live HUD Overlay */}
      {showAmbulanceRoute && (
        <div className="absolute bottom-3 left-3 z-10 p-3 rounded-xl bg-ink-950/90 backdrop-blur border border-ink-800 shadow-2xl text-white max-w-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono text-primary-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <span className="live-dot" style={{ width: 6, height: 6 }} /> 5 CONNECTED HOSPITAL CORRIDORS
            </span>
            <span className="text-[10px] font-mono text-ink-400">ETA 4m 15s</span>
          </div>
          <p className="text-xs font-bold text-white mb-1">Ambulance AMB-08 ➔ Emergency Point</p>
          <div className="w-full bg-ink-900 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-primary-500 h-1.5 rounded-full transition-all duration-300 shadow-glow-primary"
              style={{ width: `${Math.round(((currentSegmentIndex + progress) / (activeRoute.length - 1)) * 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
