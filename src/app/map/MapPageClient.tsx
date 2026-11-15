"use client";

import { useEffect, useState } from "react";
import { MapView } from "@/components/map/MapView";
import { ChurchModal } from "@/components/church/ChurchModal";
import { useChurches } from "@/hooks/useChurches";
import { useMapStore } from "@/lib/store/mapStore";
import { MapBounds } from "@/lib/query/keys";
import Link from "next/link";

export function MapPageClient() {
  const { viewport, setViewport, selectedChurchId, setSelectedChurchId } = useMapStore();
  const [churches, setChurches] = useState<any[]>([]);
  const [bounds, setBounds] = useState<MapBounds | null>(null);

  // Fetch churches for current viewport
  const { data, refetch } = useChurches({ bounds: bounds || undefined, enabled: !!bounds });

  useEffect(() => {
    if (data?.churches) setChurches(data.churches);
  }, [data]);

  useEffect(() => {
    if (!viewport) return;
    const debounced = setTimeout(() => setBounds(viewport), 300);
    return () => clearTimeout(debounced);
  }, [viewport]);

  const handlePinClick = (church: any) => {
    setSelectedChurchId(church.id);
  };

  return (
    <div className="relative w-full h-screen">
      <MapView
        churches={churches}
        className="absolute inset-0"
      />
      {selectedChurchId && (
        <ChurchModal
          church={churches.find((c) => c.id === selectedChurchId)}
          onClose={() => setSelectedChurchId(null)}
        />
      )}
      {/* Top controls */}
      <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
        <div className="flex gap-2">
          <Link
            href="/login"
            className="px-4 py-2 bg-background/90 backdrop-blur rounded-lg border border-border text-sm font-medium hover:bg-background"
          >
            Sign in to rate
          </Link>
        </div>
      </div>
    </div>
  );
}