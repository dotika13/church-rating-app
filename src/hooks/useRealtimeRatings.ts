"use client";

import { useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";

export function useRealtimeRatings(churchId: string, enabled = true) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  useEffect(() => {
    if (!enabled || !churchId) return;

    const channel = supabase
      .channel(`ratings:church_id=eq.${churchId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ratings", filter: `church_id=eq.${churchId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: queryKeys.churches.detail(churchId) });
          queryClient.invalidateQueries({ queryKey: queryKeys.churches.ratings(churchId) });
          queryClient.invalidateQueries({ queryKey: queryKeys.churches.aggregates(churchId) });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [churchId, enabled, queryClient, supabase]);
}

export function useRealtimeChurches(groupId: string | null, enabled = true) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  useEffect(() => {
    if (!enabled) return;

    let filter = "";
    if (groupId) filter = `group_id=eq.${groupId}`;
    else filter = "group_id.is.null"; // public

    const channel = supabase
      .channel(`churches:${filter}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "churches", filter },
        () => {
          queryClient.invalidateQueries({ queryKey: queryKeys.churches.all() });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [groupId, enabled, queryClient, supabase]);
}