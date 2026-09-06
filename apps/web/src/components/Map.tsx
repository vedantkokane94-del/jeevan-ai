/* eslint-disable */
"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import MapGL, { Marker, NavigationControl, FullscreenControl, Source, Layer, useMap } from "react-map-gl/maplibre";
import type { MapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import type { LayerProps } from "react-map-gl/maplibre";
import { motion } from "framer-motion";

export interface MapPoint {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  type: "ambulance" | "hospital" | "camp" | "zone" | "incident" | "person" | "donor";
  severity?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  metadata?: any;
}

export interface MapProps {
  center: [number, number]; // [lat, lng]
  zoom?: number;
  points?: MapPoint[];
  onPointClick?: (point: MapPoint) => void;
  className?: string;
  theme?: "light" | "dark";
  mapRef?: React.RefObject<MapRef | null>;
  heatmapData?: any; // GeoJSON FeatureCollection
  corridorsData?: any; // GeoJSON LineString
  liveRouteData?: any; // GeoJSON LineString for ambulance path
  animateOnLoad?: boolean;
}

const buildingLayer: LayerProps = {
  id: "3d-buildings",
  source: "openmaptiles",
  "source-layer": "building",
  filter: ["==", "extrude", "true"],
  type: "fill-extrusion",
  minzoom: 14,
  paint: {
    "fill-extrusion-color": "#1a1c23",
    "fill-extrusion-height": ["get", "height"],
    "fill-extrusion-base": ["get", "min_height"],
    "fill-extrusion-opacity": 0.9
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
      0.2, "rgba(234,179,8,0.2)",  // yellow
      0.4, "rgba(249,115,22,0.4)", // orange
      0.6, "rgba(239,68,68,0.6)",  // red
      0.8, "rgba(220,38,38,0.8)",  // darker red
      1, "rgba(153,27,27,1)"       // deepest red
    ],
    "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 11, 15, 18, 40],
    "heatmap-opacity": ["interpolate", ["linear"], ["zoom"], 14, 0.9, 18, 0.4]
  }
};

const corridorLayer: LayerProps = {
  id: "emergency-corridors",
  type: "line",
  source: "corridors-source",
  layout: {
    "line-join": "round",
    "line-cap": "round"
  },
  paint: {
    "line-color": ["get", "color"], // Color passed from geojson properties
    "line-width": 6,
    "line-opacity": 0.8,
  }
};

function CinematicController({ center, animateOnLoad }: { center: [number, number], animateOnLoad: boolean }) {
  const { current: map } = useMap();

  useEffect(() => {
    if (map && animateOnLoad) {
      // Start high up and zoom in cinematically with a 360 sweep
      map.flyTo({
        center: [center[1], center[0]],
        zoom: 10.5,
        pitch: 0,
        bearing: 360 - 25,
        duration: 12000,
        essential: true,
      });
    }
  }, [map, center, animateOnLoad]);

  return null;
}

export function Map({
  center,
  zoom = 14,
  points = [],
  onPointClick,
  className = "",
  theme = "dark",
  mapRef,
  heatmapData = null,
  corridorsData = null,
  liveRouteData = null,
  animateOnLoad = true,
}: MapProps) {

  const satelliteStyle: any = {
    version: 8,
    sources: {
      "esri-satellite": {
        type: "raster",
        tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
        tileSize: 256,
        attribution: "Esri"
      },
      "esri-labels": {
        type: "raster",
        tiles: ["https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"],
        tileSize: 256
      },
      "terrain": {
        type: "raster-dem",
        tiles: ["https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"],
        encoding: "terrarium",
        tileSize: 256,
        attribution: "AWS Terrarium"
      }
    },
    layers: [
      {
        id: "satellite-layer",
        type: "raster",
        source: "esri-satellite",
        paint: {
          "raster-opacity": 1.0,
          "raster-contrast": theme === "dark" ? 0.4 : 0,
          "raster-saturation": theme === "dark" ? -0.5 : 0,
          "raster-brightness-max": theme === "dark" ? 0.3 : 1.0
        }
      },
      {
        id: "satellite-labels",
        type: "raster",
        source: "esri-labels",
        paint: { "raster-opacity": 0.9 }
      }
    ],
    terrain: {
      source: "terrain",
      exaggeration: 1.8
    }
  };

  const mapStyle = satelliteStyle;

  const renderMarkerIcon = (point: MapPoint) => {
    switch (point.type) {
      case "ambulance":
        const isActive = point.metadata?.status === "DISPATCHED" || point.metadata?.status === "EN_ROUTE";
        return (
          <div className={`relative flex items-center justify-center cursor-pointer group ${isActive ? "scale-125" : "scale-100"} transition-transform duration-500`}>
            {isActive && (
              <>
                <div className="absolute inset-0 bg-alert-500 rounded-full animate-ping opacity-50 animation-delay-0"></div>
                <div className="absolute inset-0 bg-sky-500 rounded-full animate-ping opacity-50 animation-delay-500"></div>
              </>
            )}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 
                ${isActive ? 'bg-ink-950 border-2 border-white shadow-[0_0_20px_rgba(239,68,68,0.8),0_0_40px_rgba(14,165,233,0.8)]' : 'bg-sky-950 border border-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.8)]'}`}>
              <span className="text-sm">🚑</span>
            </div>
            <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-ink-950 border border-sky-500 text-sky-400 text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap pointer-events-none z-50">
              {point.title} <br />
              {point.metadata?.speed && `${point.metadata.speed} km/h`}
            </div>
          </div>
        );
      case "hospital":
        return (
          <div className="relative flex items-center justify-center cursor-pointer group">
            <div className="w-8 h-8 bg-indigo-950 border border-indigo-500 rounded flex items-center justify-center relative z-10 shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-transform hover:scale-110">
              <span className="text-sm">🏥</span>
            </div>
            <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-ink-950 border border-indigo-500 text-indigo-400 text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap pointer-events-none">
              {point.title}
            </div>
          </div>
        );
      case "camp":
        return (
          <div className="relative flex items-center justify-center cursor-pointer group hover:scale-110 transition-transform">
            <div className="w-7 h-7 bg-emerald-950 border border-emerald-500 rounded-full flex items-center justify-center relative z-10 shadow-[0_0_10px_rgba(16,185,129,0.5)]">
              <span className="text-sm">⛑</span>
            </div>
            <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-ink-950 border border-emerald-500 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap pointer-events-none">
              {point.title}
            </div>
          </div>
        );
      case "incident":
        return (
          <div className="relative flex items-center justify-center cursor-pointer group hover:scale-110 transition-transform">
            <div className="absolute inset-0 bg-alert-500 rounded-full animate-pulse opacity-50"></div>
            <div className="w-6 h-6 bg-alert-950 border-2 border-alert-500 rounded-full flex items-center justify-center relative z-10 shadow-glow-alert">
              <span className="text-[10px] text-alert-500 font-bold">SOS</span>
            </div>
            <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-ink-950 border border-alert-500 text-alert-400 text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap pointer-events-none z-50">
              {point.title}
            </div>
          </div>
        );
      case "zone":
      default:
        return (
          <div className="relative flex flex-col items-center justify-center cursor-pointer group transition-transform hover:-translate-y-1">
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center relative z-10 shadow-lg bg-ink-950
                ${point.severity === "CRITICAL" ? "border-alert-500 shadow-glow-alert" :
                point.severity === "HIGH" ? "border-accent-500 shadow-glow-accent" : "border-primary-500 shadow-glow-primary"}`}
            >
              <span className="text-[10px] text-white font-bold">{point.metadata?.risk || 50}</span>
            </div>
            <div className="mt-1 bg-ink-950/80 backdrop-blur border border-ink-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider whitespace-nowrap">
              {point.title}
            </div>
          </div>
        );
    }
  }

  return (
    <div className={`w-full h-full relative z-0 rounded-xl overflow-hidden bg-ink-950 ${className}`}>
      <MapGL
        ref={mapRef}
        initialViewState={{
          longitude: center[1],
          latitude: center[0],
          zoom: animateOnLoad ? 11 : zoom,
          pitch: animateOnLoad ? 0 : 65,
          bearing: animateOnLoad ? 0 : -25
        }}
        mapStyle={mapStyle}
        style={{ width: "100%", height: "100%" }}
        interactiveLayerIds={['3d-buildings']}
      >
        <CinematicController center={center} animateOnLoad={animateOnLoad} />

        <NavigationControl position="bottom-right" />
        <FullscreenControl position="bottom-right" />

        {/* 3D Buildings Layer (Optional, depends on tileset, but standard Carto DB doesn't have 3d buildings out of the box in this free tier, we will leave it in case we inject OpenMapTiles) */}

        {/* Dynamic Crowd Density Heatmap Layer */}
        {heatmapData && (
          <Source id="crowd-heat-source" type="geojson" data={heatmapData}>
            <Layer {...heatmapLayer} />
          </Source>
        )}

        {/* Emergency Corridors Layer */}
        {corridorsData && (
          <Source id="corridors-source" type="geojson" data={corridorsData}>
            <Layer {...corridorLayer} />
          </Source>
        )}

        {/* Live Ambulance Route Layer */}
        {liveRouteData && (
          <Source id="live-route-source" type="geojson" data={liveRouteData}>
            <Layer
              id="live-route"
              type="line"
              layout={{ "line-join": "round", "line-cap": "round" }}
              paint={{
                "line-color": "#38bdf8", // Sky blue for AI route
                "line-width": 6,
                "line-opacity": 0.9,
              }}
            />
          </Source>
        )}

        {/* Dynamic Markers */}
        {points.map((point) => (
          <Marker
            key={point.id}
            longitude={point.longitude}
            latitude={point.latitude}
            anchor="bottom"
            onClick={(e: any) => {
              e.originalEvent.stopPropagation();
              if (onPointClick) onPointClick(point);
            }}
            style={{ zIndex: point.type === "ambulance" ? 50 : point.type === "incident" ? 40 : 10 }}
          >
            {renderMarkerIcon(point)}
          </Marker>
        ))}
      </MapGL>
    </div>
  );
}
