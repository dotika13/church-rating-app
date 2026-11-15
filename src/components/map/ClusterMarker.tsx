"use client";

import { cn } from "@/lib/utils";
import Supercluster from "supercluster";

type ClusterFeature = Supercluster.ClusterFeature<any>;

interface ClusterMarkerProps {
  cluster: ClusterFeature;
  onClick: () => void;
}

export function ClusterMarker({ cluster, onClick }: ClusterMarkerProps) {
  const count = cluster.properties.point_count;
  const abbreviated = count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count;

  let size = 32;
  let color = "#c66b4b";
  if (count >= 100) { size = 48; color = "#b05a3f"; }
  else if (count >= 10) { size = 40; color = "#7a9e7e"; }

  return (
    <div
      className={cn("flex items-center justify-center cursor-pointer font-serif font-medium text-white transition-transform duration-100 hover:scale-110")}
      style={{ width: size, height: size, borderRadius: "50%", backgroundColor: color, boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}
      onClick={onClick}
    >
      {abbreviated}
    </div>
  );
}