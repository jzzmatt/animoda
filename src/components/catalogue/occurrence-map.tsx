"use client";

import { useEffect, useRef } from "react";
import { LngLatBounds, Map, NavigationControl, setWorkerUrl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

setWorkerUrl("/maplibre-gl-worker.js");
import { mapStyleUrl } from "@/content/catalogue";
import type { OccurrencePoint } from "@/server/wildlife";

export function OccurrenceMap({ points }: { points: OccurrencePoint[] }) {
  const container = useRef<HTMLDivElement>(null);
  const signature = points.map((point) => `${point.lng},${point.lat}`).join("|");

  useEffect(() => {
    const node = container.current;
    if (!node) return;
    const map = new Map({
      container: node,
      style: mapStyleUrl,
      center: [20, 0],
      zoom: 1.15,
      attributionControl: { compact: true },
    });
    map.addControl(new NavigationControl({ showCompass: false }), "top-right");
    map.on("load", () => {
      map.addSource("occurrences", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: points.map((point) => ({
            type: "Feature",
            properties: { country: point.country ?? "" },
            geometry: { type: "Point", coordinates: [point.lng, point.lat] },
          })),
        },
      });
      map.addLayer({
        id: "occurrences",
        type: "circle",
        source: "occurrences",
        paint: {
          "circle-radius": 5,
          "circle-color": "#064E3B",
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "#F8F3E8",
        },
      });
      if (points.length > 0) {
        const bounds = new LngLatBounds();
        for (const point of points) bounds.extend([point.lng, point.lat]);
        map.fitBounds(bounds, { padding: 36, maxZoom: 4.5, duration: 0 });
      }
    });
    return () => {
      map.remove();
    };
  }, [signature, points]);

  return <div ref={container} className="h-80 w-full overflow-hidden rounded-3xl bg-surface-container" />;
}
