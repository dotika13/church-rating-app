"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl, { Map, LngLatBounds, MapMouseEvent } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapBounds } from "@/lib/query/keys";
import { HUNGARY_CENTER, DEFAULT_ZOOM, MAP_STYLE_URL } from "@/lib/map/utils";
import { useMapStore } from "@/lib/store/mapStore";

export function useMap(containerRef: React.RefObject<HTMLDivElement | null>) {
  const mapRef = useRef<Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const { setViewport, selectedChurchId, setSelectedChurchId } = useMapStore();

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE_URL,
      center: HUNGARY_CENTER,
      zoom: DEFAULT_ZOOM,
      attributionControl: false,
      preserveDrawingBuffer: true
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserLocation: true
      }),
      "top-right"
    );

    map.on("load", () => {
      setMapLoaded(true);
      updateViewport(map);
    });

    map.on("moveend", () => updateViewport(map));
    map.on("click", (e: MapMouseEvent) => {
      if (!e.originalEvent.defaultPrevented) setSelectedChurchId(null);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      setMapLoaded(false);
    };
  }, [containerRef, setViewport, setSelectedChurchId]);

  const updateViewport = (map: Map) => {
    const bounds = map.getBounds();
    if (!bounds) return;
    setViewport({
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest(),
      zoom: map.getZoom()
    });
  };

  const flyTo = (lng: number, lat: number, zoom = 15) => {
    mapRef.current?.flyTo({ center: [lng, lat], zoom, essential: true });
  };

  return { map: mapRef.current, mapLoaded, flyTo };
}