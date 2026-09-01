/* eslint-disable */
"use client";

import * as React from "react";
import MapGL, { Marker, NavigationControl, FullscreenControl, Source, Layer } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import type { LayerProps } from "react-map-gl/maplibre";
import type { MapLayerMouseEvent } from "maplibre-gl";

export interface MapPoint {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
}

export interface MapProps {
  center: [number, number]; // [lat, lng]
  zoom?: number;
  points?: MapPoint[];
  onPointClick?: (id: string) => void;
  className?: string;
  theme?: "light" | "dark";
  heatmapData?: any; // GeoJSON FeatureCollection
}

const buildingLayer: LayerProps = {
  id: "3d-buildings",
  source: "openmaptiles",
  "source-layer": "building",
  filter: ["==", "extrude", "true"],
  type: "fill-extrusion",
  minzoom: 15,
  paint: {
    "fill-extrusion-color": "#2c3040", 
    "fill-extrusion-height": ["get", "height"],
    "fill-extrusion-base": ["get", "min_height"],
    "fill-extrusion-opacity": 0.8
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

export function Map({
  center,
  zoom = 14,
  points = [],
  onPointClick,
  className = "",
  theme = "dark",
  heatmapData = null,
}: MapProps) {
  
  // Free public CartoDB map style for MapLibre
  const mapStyle = theme === "dark"
    ? "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
    : "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

  const handleMarkerClick = (e: MapLayerMouseEvent, pointId: string) => {
    e.originalEvent.stopPropagation();
    if (onPointClick) onPointClick(pointId);
  };

  return (
    <div className={`w-full h-full relative z-0 rounded-xl overflow-hidden ${className}`}>
      <MapGL
        initialViewState={{
          longitude: center[1],
          latitude: center[0],
          zoom: zoom,
          pitch: 60, // Premium 3D tilt
          bearing: -17.6 // Slight rotation for aesthetic depth
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

        {points.map((point) => (
          <Marker
            key={point.id}
            longitude={point.longitude}
            latitude={point.latitude}
            anchor="bottom"
            onClick={(e: MapLayerMouseEvent) => handleMarkerClick(e, point.id)}
          >
            <div className={`w-6 h-6 rounded-full border-2 border-white shadow-glow-primary flex items-center justify-center cursor-pointer transition-transform hover:scale-110
              ${point.severity === "CRITICAL" ? "bg-alert-500 animate-pulse shadow-glow-alert" : 
                point.severity === "HIGH" ? "bg-accent-500" : 
                point.severity === "MEDIUM" ? "bg-primary-500" : "bg-success-500"}`}
            >
               <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            {/* Simple tooltip always visible for dashboard feel */}
            <div className="absolute top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-ink-950 border border-ink-800 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg">
              {point.title}
            </div>
          </Marker>
        ))}
      </MapGL>
    </div>
  );
}
