"use client";

import { useRef, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useMap } from "@/hooks/useMap";
import { Church } from "@/db/schema";
import Supercluster from "supercluster";
import { useMapStore } from "@/lib/store/mapStore";

interface MapViewProps {
  churches: Church[];
  className?: string;
}

export function MapView({ churches, className }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { map, mapLoaded, flyTo } = useMap(containerRef);
  const { selectedChurchId, setSelectedChurchId, clusterEnabled } = useMapStore();

  // Supercluster instance
  const cluster = useMemo(() => {
    return new Supercluster({
      radius: 60,
      maxZoom: 16,
      minZoom: 0,
      extent: 512
    });
  }, []);

  // Load points into supercluster when churches change
  useEffect(() => {
    const points = churches.map((church) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [church.lng, church.lat]
      },
      properties: { churchId: church.id }
    }));
    cluster.load(points);
  }, [churches, cluster]);

  // Render markers/clusters based on current zoom
  useEffect(() => {
    if (!map || !mapLoaded) return;

    const zoom = Math.floor(map.getZoom());
    const bounds = map.getBounds();
    if (!bounds) return;

    const bbox: [number, number, number, number, number, number] = [
      bounds.getWest(),
      bounds.getSouth(),
      -Infinity,
      bounds.getEast(),
      bounds.getNorth(),
      Infinity
    ];

    const clusters = cluster.getClusters(bbox, zoom);

    // Clear existing layers
    ["church-markers", "church-clusters", "cluster-count"].forEach((id) => {
      if (map.getLayer(id)) map.removeLayer(id);
      if (map.getSource(id)) map.removeSource(id);
    });

    // Add GeoJSON source
    map.addSource("churches", {
      type: "geojson",
      data: { type: "FeatureCollection", features: clusters }
    });

    // Cluster circles
    if (clusterEnabled) {
      map.addLayer({
        id: "church-clusters",
        type: "circle",
        source: "churches",
        filter: ["has", "point_count"],
        paint: {
          "circle-radius": ["step", ["get", "point_count"], 20, 10, 30, 100, 40],
          "circle-color": ["step", ["get", "point_count"], "#c66b4b", 10, "#7a9e7e", 100, "#b05a3f"],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#fff"
        }
      });

      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "churches",
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-font": ["Crimson Text Bold", "Arial Unicode MS Bold"],
          "text-size": 14
        },
        paint: { "text-color": "#fff", "text-halo-color": "#000", "text-halo-width": 1 }
      });
    }

    // Individual pins
    map.addLayer({
      id: "church-markers",
      type: "symbol",
      source: "churches",
      filter: ["!", ["has", "point_count"]],
      layout: {
        "icon-image": "pin",
        "icon-allow-overlap": true,
        "icon-size": 1
      }
    });

    // Add pin image if not exists
    if (!map.hasImage("pin")) {
      const canvas = document.createElement("canvas");
      canvas.width = 48;
      canvas.height = 48;
      const ctx = canvas.getContext("2d")!;
      // Draw default pin (will be overridden by custom layer below)
      ctx.fillStyle = "#c66b4b";
      ctx.beginPath();
      ctx.moveTo(24, 4);
      ctx.bezierCurveTo(24, 4, 4, 4, 4, 22);
      ctx.bezierCurveTo(4, 22, 24, 40, 24, 40);
      ctx.bezierCurveTo(24, 40, 44, 22, 44, 22);
      ctx.bezierCurveTo(44, 22, 24, 4, 24, 4);
      ctx.fill();
      const imageData = ctx.getImageData(0, 0, 48, 48);
      map.addImage("pin", imageData, { sdf: false });
    }

    // Click handler for clusters
    const handleClusterClick = (e: any) => {
      const features = map.queryRenderedFeatures(e.point, { layers: ["church-clusters"] });
      if (!features.length) return;
      const clusterId = features[0].properties?.cluster_id;
      if (clusterId === undefined) return;
      const expansionZoom = cluster.getClusterExpansionZoom(clusterId);
      const coords = features[0].geometry as GeoJSON.Point;
      map.flyTo({ center: coords.coordinates as [number, number], zoom: expansionZoom });
    };

    // Click handler for individual pins
    const handlePinClick = (e: any) => {
      const features = map.queryRenderedFeatures(e.point, { layers: ["church-markers"] });
      if (!features.length) return;
      const churchId = features[0].properties?.churchId;
      if (churchId) setSelectedChurchId(churchId);
    };

    map.on("click", "church-clusters", handleClusterClick);
    map.on("click", "church-markers", handlePinClick);

    map.getCanvas().style.cursor = "default";
    map.on("mouseenter", "church-clusters", () => map.getCanvas().style.cursor = "pointer");
    map.on("mouseleave", "church-clusters", () => map.getCanvas().style.cursor = "default");
    map.on("mouseenter", "church-markers", () => map.getCanvas().style.cursor = "pointer");
    map.on("mouseleave", "church-markers", () => map.getCanvas().style.cursor = "default");

    return () => {
      map.off("click", "church-clusters", handleClusterClick);
      map.off("click", "church-markers", handlePinClick);
    };
  }, [map, mapLoaded, churches, cluster, clusterEnabled, setSelectedChurchId]);

  // When selectedChurchId changes externally, fly to it
  useEffect(() => {
    if (!map || !mapLoaded || !selectedChurchId) return;
    const church = churches.find((c) => c.id === selectedChurchId);
    if (church) flyTo(church.lng, church.lat, 16);
  }, [selectedChurchId, map, mapLoaded, churches, flyTo]);

  return (
    <div
      ref={containerRef}
      className={cn("w-full h-full", className)}
      style={{ width: "100%", height: "100%" }}
    />
  );
}