import { useQuery } from "@tanstack/react-query";
import { queryKeys, ChurchListParams, MapBounds } from "@/lib/query/keys";

interface UseChurchesOptions {
  params?: ChurchListParams;
  bounds?: MapBounds;
  enabled?: boolean;
}

export function useChurches({ params, bounds, enabled = true }: UseChurchesOptions) {
  return useQuery({
    queryKey: bounds
      ? queryKeys.churches.inBounds(bounds)
      : queryKeys.churches.list(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) searchParams.set(key, String(value));
        });
      }
      if (bounds) {
        searchParams.set("north", String(bounds.north));
        searchParams.set("south", String(bounds.south));
        searchParams.set("east", String(bounds.east));
        searchParams.set("west", String(bounds.west));
      }
      const res = await fetch(`/api/churches?${searchParams.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch churches");
      return res.json();
    },
    enabled,
    staleTime: bounds ? 30_000 : 60_000 // Shorter stale time for bounds queries
  });
}

export function useChurchDetail(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.churches.detail(id),
    queryFn: async () => {
      const res = await fetch(`/api/churches/${id}`);
      if (!res.ok) throw new Error("Failed to fetch church");
      return res.json();
    },
    enabled
  });
}

export function useChurchRatings(churchId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.churches.ratings(churchId),
    queryFn: async () => {
      const res = await fetch(`/api/churches/${churchId}/ratings`);
      if (!res.ok) throw new Error("Failed to fetch ratings");
      return res.json();
    },
    enabled
  });
}

export function useMyRating(churchId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.ratings.mine(churchId),
    queryFn: async () => {
      const res = await fetch(`/api/churches/${churchId}/ratings/mine`);
      if (!res.ok) throw new Error("Failed to fetch my rating");
      return res.json();
    },
    enabled
  });
}

export function useChurchMedia(churchId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.churches.media(churchId),
    queryFn: async () => {
      const res = await fetch(`/api/churches/${churchId}/media`);
      if (!res.ok) throw new Error("Failed to fetch media");
      return res.json();
    },
    enabled
  });
}