import { create } from "zustand";
import { MapBounds } from "@/lib/query/keys";

interface MapState {
  viewport: MapBounds | null;
  setViewport: (viewport: MapBounds) => void;
  selectedChurchId: string | null;
  setSelectedChurchId: (id: string | null) => void;
  clusterEnabled: boolean;
  setClusterEnabled: (enabled: boolean) => void;
}

export const useMapStore = create<MapState>((set) => ({
  viewport: null,
  setViewport: (viewport) => set({ viewport }),
  selectedChurchId: null,
  setSelectedChurchId: (selectedChurchId) => set({ selectedChurchId }),
  clusterEnabled: true,
  setClusterEnabled: (clusterEnabled) => set({ clusterEnabled })
}));