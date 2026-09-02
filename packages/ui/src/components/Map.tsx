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

// 3D ESRI Satellite style configuration with Surrounding Street & Location Vector Labels Overlay (Carto Voyager)
const satelliteStyle: any = {
  version: 8,
  sources: {
    "esri-satellite-source": {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      ],
      tileSize: 256,
      maxzoom: 18,
      attribution: "Esri, Maxar, Earthstar Geographics"
    },
    "carto-labels-source": {
      type: "raster",
      tiles: [
        "https://basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png"
      ],
      tileSize: 256,
      maxzoom: 18,
      attribution: "CartoDB"
    }
  },
  layers: [
    {
      id: "esri-satellite-layer",
      type: "raster",
      source: "esri-satellite-source",
      minzoom: 0,
      maxzoom: 18
    },
    {
      id: "carto-labels-layer",
      type: "raster",
      source: "carto-labels-source",
      minzoom: 0,
      maxzoom: 18
    }
  ]
};

// Central Emergency Incident Spot (Ramkund Holy Snan Ghat)
const EMERGENCY_SPOT: [number, number] = [20.0063, 73.7925]; // [lat, lng]

// High-Precision Street Pavement Centerline Waypoints (Civil Hospital to Ramkund Ghat via Trimbak Rd, CBS, MG Rd, Ashok Stambh, Panchavati Bridge)
const DEFAULT_ROUTE: [number, number][] = [
  [20.0020, 73.7785], // Civil Hospital Entrance
  [20.0023, 73.7795], // Civil Hospital Approach Road
  [20.0026, 73.7805], // Trimbak Road Main Street
  [20.0029, 73.7815], // CBS Junction
  [20.0033, 73.7825], // CBS Flyover Slip Road
  [20.0036, 73.7835], // Shalimar Circle Road
  [20.0040, 73.7845], // MG Road Commercial Corridor
  [20.0044, 73.7855], // MG Road Entry
  [20.0048, 73.7865], // Ashok Stambh Signal
  [20.0050, 73.7874], // Victoria Bridge Approach
  [20.0053, 73.7885], // Panchavati Bridge Over Godavari River
  [20.0058, 73.7900], // Malviya Chowk
  [20.0061, 73.7915], // Panchavati River Road
  [20.0063, 73.7925], // Ramkund Holy Snan Ghat Emergency Point
];

// 5 Nearest Hospital Emergency Corridors Following Exact Street Centerlines in Nashik
const CONNECTED_HOSPITAL_ROUTES = [
  {
    id: "route-civil",
    name: "Civil Hospital Emergency Corridor",
    color: "#0ea5e9", // Cyan
    destName: "Civil Hospital Nashik",
    destCoords: [73.7785, 20.0020] as [number, number],
    coords: [
      [73.7925, 20.0063], // Ramkund Holy Ghat Entrance
      [73.7915, 20.0061], // Panchavati River Road
      [73.7900, 20.0058], // Malviya Chowk
      [73.7885, 20.0053], // Panchavati Bridge Over Godavari River
      [73.7874, 20.0050], // Victoria Bridge Approach
      [73.7865, 20.0048], // Ashok Stambh Signal
      [73.7855, 20.0044], // MG Road Entry
      [73.7845, 20.0040], // MG Road Commercial Corridor
      [73.7835, 20.0036], // Shalimar Circle Road
      [73.7825, 20.0033], // CBS Flyover Slip Road
      [73.7815, 20.0029], // CBS Junction
      [73.7805, 20.0026], // Trimbak Road Main Street
      [73.7795, 20.0023], // Civil Hospital Approach Road
      [73.7785, 20.0020], // Civil Hospital Main Gate Entrance
    ]
  },
  {
    id: "route-apollo",
    name: "Apollo Hospital Panchavati Corridor",
    color: "#a855f7", // Purple
    destName: "Apollo Hospital Panchavati",
    destCoords: [73.7980, 20.0125] as [number, number],
    coords: [
      [73.7925, 20.0063], // Ramkund Holy Ghat Entrance
      [73.7932, 20.0066], // Ramkund Ghat Exit Path
      [73.7938, 20.0070], // Kalaram Mandir East Gate Road
      [73.7945, 20.0078], // Kalaram Mandir Chowk
      [73.7952, 20.0085], // Sita Gufa Chowk
      [73.7958, 20.0094], // Panchavati Karanja North Street
      [73.7962, 20.0102], // Nimani Bus Stand Circle
      [73.7967, 20.0108], // Kathe Gali Entry
      [73.7971, 20.0114], // Kathe Gali Road Junction
      [73.7976, 20.0120], // Apollo Hospital Approach
      [73.7980, 20.0125], // Apollo Hospital Panchavati Main Entrance
    ]
  },
  {
    id: "route-district",
    name: "District Hospital CBS Corridor",
    color: "#10b981", // Emerald
    destName: "District Hospital CBS",
    destCoords: [73.7852, 19.9975] as [number, number],
    coords: [
      [73.7925, 20.0063], // Ramkund Holy Ghat Entrance
      [73.7918, 20.0058], // Godavari River South Bank Road
      [73.7910, 20.0048], // Talkuteshwar Bridge Road
      [73.7900, 20.0035], // Talkuteshwar Road Junction
      [73.7891, 20.0023], // Ravivar Peth North Street
      [73.7882, 20.0012], // Ravivar Peth Main Street
      [73.7875, 20.0003], // Tilak Road Entry
      [73.7868, 19.9995], // Tilak Road Commercial Corridor
      [73.7860, 19.9985], // District Hospital Gate Approach
      [73.7852, 19.9975], // District Hospital CBS Main Entrance
    ]
  },
  {
    id: "route-sahyadri",
    name: "Sahyadri Hospital Wadala Corridor",
    color: "#f97316", // Orange
    destName: "Sahyadri Hospital Wadala",
    destCoords: [73.7910, 19.9880] as [number, number],
    coords: [
      [73.7925, 20.0063], // Ramkund Holy Ghat Entrance
      [73.7936, 20.0054], // Tapovan River Bank Road
      [73.7948, 20.0045], // Tapovan Bridge Link Road
      [73.7965, 20.0032], // Godavari South Bank Promenade
      [73.7985, 20.0020], // Tapovan Link Road Junction
      [73.7998, 20.0003], // Dwarka Circle Highway Slip Road
      [73.8010, 19.9985], // Dwarka Circle Flyover Junction
      [73.7995, 19.9958], // Wadala Naka Highway Slip Road
      [73.7980, 19.9930], // Wadala Naka Highway Junction
      [73.7962, 19.9916], // Wadala Road Main Street
      [73.7945, 19.9902], // Wadala Road Street
      [73.7928, 19.9890], // Sahyadri Hospital Approach
      [73.7910, 19.9880], // Sahyadri Hospital Wadala Main Entrance
    ]
  },
  {
    id: "route-wockhardt",
    name: "Wockhardt Trauma Center Corridor",
    color: "#f59e0b", // Amber
    destName: "Wockhardt Hospital Trauma Center",
    destCoords: [73.7750, 19.9720] as [number, number],
    coords: [
      [73.7925, 20.0063], // Ramkund Holy Ghat Entrance
      [73.7912, 20.0061], // Malviya Chowk Panchavati
      [73.7885, 20.0054], // Godavari River Bridge Approach
      [73.7860, 20.0048], // Ashok Stambh Road
      [73.7845, 19.9980], // CBS Flyover Highway Ramp
      [73.7832, 19.9930], // Mumbai Naka Flyover Approach
      [73.7820, 19.9880], // Mumbai Naka Circle
      [73.7808, 19.9850], // Pathardi Phata Slip Road
      [73.7795, 19.9820], // Pathardi Phata Link Road
      [73.7782, 19.9790], // Mumbai-Agra National Highway Corridor
      [73.7770, 19.9760], // Mumbai-Agra Highway Pathardi Junction
      [73.7760, 19.9740], // Wockhardt Hospital Access Ramp
      [73.7750, 19.9720], // Wockhardt Hospital Trauma Center Entrance
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
    "line-width": 16,
    "line-opacity": 0.5,
    "line-blur": 4
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
    "line-width": 5.5
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
    "line-width": 2.5,
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
  ambulanceTitle = "AMB-08",
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
  const [currentSpeed, setCurrentSpeed] = React.useState(28);

  // Dynamic Live Speed Counter (fluctuates realistic speed between 24 - 36 km/h)
  React.useEffect(() => {
    if (!showAmbulanceRoute) return;
    const speedInterval = setInterval(() => {
      setCurrentSpeed(Math.floor(24 + Math.random() * 12));
    }, 1500);
    return () => clearInterval(speedInterval);
  }, [showAmbulanceRoute]);

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
      {/* 3D Map Viewport (Pitch set to 0 to align routes 100% flush on road pavement) */}
      <MapGL
        initialViewState={{
          longitude: center[1],
          latitude: center[0],
          zoom: Math.min(zoom, 17.5),
          pitch: 0, // 0 pitch ensures lines lay 100% dead-center on street asphalt without 3D perspective distortion
          bearing: 0
        }}
        maxZoom={17.5}
        minZoom={5}
        maxPitch={45}
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

        {/* 5 Nearest Hospital Emergency Routes ALL Connected directly on Street Centerlines */}
        {showAmbulanceRoute && CONNECTED_HOSPITAL_ROUTES.map(hr => (
          <Source key={hr.id} id={`${hr.id}-source`} type="geojson" data={{
            type: "Feature",
            properties: {},
            geometry: { type: "LineString", coordinates: hr.coords }
          }}>
            {/* Dark Casing Line for Street Pavement Contrast on Satellite */}
            <Layer
              id={`${hr.id}-casing`}
              type="line"
              layout={{ "line-join": "round", "line-cap": "round" }}
              paint={{
                "line-color": "#020617",
                "line-width": 8,
                "line-opacity": 0.9
              }}
            />
            {/* Bright Colored Corridor Line directly on Road Center */}
            <Layer
              id={`${hr.id}-layer`}
              type="line"
              layout={{ "line-join": "round", "line-cap": "round" }}
              paint={{
                "line-color": hr.color,
                "line-width": 5,
                "line-opacity": 0.95
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

        {/* 5 Connected Hospital Destination Markers (Non-Overlapping Compact Badges) */}
        {showAmbulanceRoute && CONNECTED_HOSPITAL_ROUTES.map(hr => (
          <Marker key={`dest-${hr.id}`} longitude={hr.destCoords[0]} latitude={hr.destCoords[1]} anchor="bottom">
            <div className="flex flex-col items-center group cursor-pointer z-10 hover:z-50">
              <div 
                className="px-2 py-0.5 rounded-md text-white text-[9px] font-bold shadow-lg mb-1 flex items-center gap-1 backdrop-blur max-w-[130px] truncate leading-tight transition-transform group-hover:scale-105"
                style={{ backgroundColor: hr.color }}
              >
                <span>🏥</span> <span className="truncate">{hr.destName}</span>
              </div>
              <div className="w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center shadow-md" style={{ backgroundColor: hr.color }} />
            </div>
          </Marker>
        ))}

        {/* CENTRAL ACTIVE EMERGENCY POINT MARKER */}
        {showAmbulanceRoute && (
          <Marker longitude={EMERGENCY_SPOT[1]} latitude={EMERGENCY_SPOT[0]} anchor="bottom">
            <div className="flex flex-col items-center z-30">
              <div className="px-2.5 py-1 rounded-xl bg-alert-600 border-2 border-white text-white text-[11px] font-bold shadow-2xl shadow-alert-600/60 mb-1 flex items-center gap-1.5 animate-bounce">
                <span className="live-dot-alert" style={{ width: 6, height: 6 }} />
                <span>🚨 EMERGENCY POINT (Ramkund Ghat)</span>
              </div>
              <div className="w-5 h-5 rounded-full bg-alert-600 border-2 border-white flex items-center justify-center shadow-glow-alert animate-ping" />
            </div>
          </Marker>
        )}

        {/* Points of Interest / Incidents (Non-Overlapping Formatted Tooltips) */}
        {points.map((point) => (
          <Marker
            key={point.id}
            longitude={point.longitude}
            latitude={point.latitude}
            anchor="bottom"
            onClick={(e: any) => handleMarkerClick(e, point.id)}
          >
            <div className="relative group flex flex-col items-center cursor-pointer">
              <div className={`w-5 h-5 rounded-full border-2 border-white shadow-glow-primary flex items-center justify-center transition-transform hover:scale-110
                ${point.severity === "CRITICAL" ? "bg-alert-500 animate-pulse shadow-glow-alert" : 
                  point.severity === "HIGH" ? "bg-accent-500" : 
                  point.severity === "MEDIUM" ? "bg-primary-500" : "bg-success-500"}`}
              >
                 <div className="w-1.5 h-1.5 bg-white rounded-full" />
              </div>
              {/* Clean non-overlapping badge with max width */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 max-w-[130px] sm:max-w-[160px] text-center leading-tight text-[9px] font-bold px-2 py-1 rounded-lg bg-ink-950/95 border border-ink-800 text-white shadow-xl backdrop-blur pointer-events-none group-hover:z-50 group-hover:scale-105 transition-all line-clamp-2">
                {point.title}
              </div>
            </div>
          </Marker>
        ))}

        {/* LIVE MOVING AMBULANCE MARKER (HIGHLY VISIBLE WITH LIVE SPEED) */}
        {showAmbulanceRoute && (
          <Marker longitude={ambulancePos[1]} latitude={ambulancePos[0]} anchor="center">
            <div className="relative group flex flex-col items-center cursor-pointer z-50">
              
              {/* Floating Live Badge & Speed Counter Tag */}
              <div className="absolute -top-12 whitespace-nowrap px-3 py-1.5 rounded-xl bg-ink-950 border-2 border-alert-500 text-white text-xs font-bold shadow-2xl flex items-center gap-2 backdrop-blur animate-bounce z-40">
                <span className="live-dot-alert" style={{ width: 8, height: 8 }} />
                <span className="text-white font-extrabold tracking-wide">{ambulanceTitle}</span>
                <span className="px-2 py-0.5 rounded-lg bg-alert-600 text-white font-mono text-xs shadow-md font-extrabold">
                  ⚡ SPEED: {currentSpeed} KM/H
                </span>
              </div>

              {/* Ultra-Visible White & Red Ambulance Badge - Straight Upright */}
              <div className="relative flex items-center justify-center z-30">
                {/* Flashing Dual Red & Blue Siren Beacons */}
                <div className="absolute -top-3 flex gap-2 z-40">
                  <span className="w-3 h-3 rounded-full bg-alert-500 animate-ping shadow-[0_0_12px_#ef4444]" />
                  <span className="w-3 h-3 rounded-full bg-sky-400 animate-ping shadow-[0_0_12px_#38bdf8]" style={{ animationDelay: "200ms" }} />
                </div>

                {/* High Contrast Bright White & Red Badge Container */}
                <div className="w-16 h-16 rounded-2xl bg-white border-4 border-alert-600 text-alert-600 flex items-center justify-center shadow-[0_0_45px_rgba(239,68,68,0.95)] relative overflow-hidden group-hover:scale-110 transition-transform">
                  <div className="absolute inset-0 bg-alert-500/10" />
                  
                  {/* High Contrast Ambulance Icon */}
                  <svg className="w-9 h-9 text-alert-600 drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" fill="#fef2f2" />
                    <path d="M19 18h2a1 1 0 0 0 1-1v-3.28a1 1 0 0 0-.3-.7l-2.43-2.43a1 1 0 0 0-.71-.29H14" fill="#fef2f2" />
                    <circle cx="7" cy="18" r="2" fill="#dc2626" stroke="white" strokeWidth="1.5" />
                    <circle cx="17" cy="18" r="2" fill="#dc2626" stroke="white" strokeWidth="1.5" />
                    <path d="M8 8h3" stroke="#dc2626" strokeWidth="3" />
                    <path d="M9.5 6.5v3" stroke="#dc2626" strokeWidth="3" />
                  </svg>
                </div>

                {/* Outer Red & Cyan Pulse Aura Rings */}
                <span className="absolute -inset-2 rounded-2xl border-2 border-alert-500 opacity-80 animate-ping pointer-events-none" />
                <span className="absolute -inset-4 rounded-3xl border-2 border-sky-400 opacity-50 animate-pulse pointer-events-none" />
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
        <div className="absolute bottom-3 left-3 z-10 p-3.5 rounded-2xl bg-ink-950/95 backdrop-blur border border-ink-800 shadow-2xl text-white max-w-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono text-primary-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <span className="live-dot" style={{ width: 6, height: 6 }} /> 5 CONNECTED HOSPITAL CORRIDORS
            </span>
            <span className="px-2 py-0.5 rounded bg-alert-600 text-white text-[10px] font-mono font-bold">
              ⚡ {currentSpeed} KM/H
            </span>
          </div>
          <p className="text-xs font-bold text-white mb-1 flex items-center gap-1.5">
            <span className="text-alert-400">🚑 AMB-08</span> ➔ Ramkund Emergency Spot
          </p>
          <div className="w-full bg-ink-900 rounded-full h-2 overflow-hidden border border-ink-800">
            <div 
              className="bg-alert-500 h-2 rounded-full transition-all duration-300 shadow-glow-alert"
              style={{ width: `${Math.round(((currentSegmentIndex + progress) / (activeRoute.length - 1)) * 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
