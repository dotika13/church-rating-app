import { MapPageClient } from "./MapPageClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Map — Sanctum",
  description: "Explore churches worldwide on the interactive map"
};

export default function MapPage() {
  return <MapPageClient />;
}