import { MapBounds } from "@/lib/query/keys";

export const HUNGARY_CENTER: [number, number] = [19.5033, 47.1625]; // [lng, lat]
export const DEFAULT_ZOOM = 7;

export const DENOMINATION_COLORS: Record<string, string> = {
  catholic: "#8b1538",
  protestant: "#1b4f72",
  orthodox: "#4a2c6e",
  other: "#5d5d5d",
  ecumenical: "#2d6a4f"
};

export function boundsToTileQuery(bounds: MapBounds) {
  return `ST_MakeEnvelope(${bounds.west}, ${bounds.south}, ${bounds.east}, ${bounds.north}, 4326)`;
}

export function getPinColor(denomination: string | null): string {
  return denomination ? DENOMINATION_COLORS[denomination] || DENOMINATION_COLORS.other : DENOMINATION_COLORS.other;
}

export const MAP_STYLE_URL = "https://demotiles.maplibre.org/style.json"; // OSM Liberty via MapLibre demo
// Or self-hosted: "https://tiles.openmaptiles.org/styles/liberty/style.json?key=YOUR_KEY"