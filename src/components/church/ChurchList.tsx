import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useChurches } from "@/hooks/useChurches";
import { ChurchCard } from "./ChurchCard";
import { ChurchListParams } from "@/lib/query/keys";
import { Skeleton } from "@/components/ui/skeleton";
import { queryKeys } from "@/lib/query/keys";
import { useState } from "react";

interface ChurchListProps {
  params?: ChurchListParams;
  className?: string;
}

export function ChurchList({ params, className }: ChurchListProps) {
  const queryClient = useQueryClient();
  const [offset, setOffset] = useState(params?.offset || 0);
  const currentParams = { ...params, offset };
  const { data, isLoading, error } = useChurches({ params: currentParams });

  if (error) return <div className="text-center py-8 text-destructive">Failed to load churches</div>;

  const loadMore = () => {
    const newOffset = offset + (params?.limit || 50);
    setOffset(newOffset);
    // Prefetch next page
    queryClient.prefetchQuery({
      queryKey: queryKeys.churches.list({ ...params, offset: newOffset }),
      queryFn: async () => {
        const searchParams = new URLSearchParams();
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) searchParams.set(key, String(value));
          });
        }
        searchParams.set("offset", String(newOffset));
        searchParams.set("limit", String(params?.limit || 50));
        const res = await fetch(`/api/churches?${searchParams.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch churches");
        return res.json();
      }
    });
  };

  return (
    <div className={cn("space-y-3", className)}>
      {isLoading && offset === 0 ? (
        Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))
      ) : data?.churches?.length === 0 && offset === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No churches found</div>
      ) : (
        <>
          {data?.churches.map((church: any) => (
            <ChurchCard
              key={church.id}
              church={church}
              onClick={() => {}}
              variant="compact"
            />
          ))}
          {data?.churches.length === (params?.limit || 50) && (
            <button
              onClick={loadMore}
              disabled={isLoading}
              className="w-full py-3 text-sm font-medium text-primary hover:text-primary/80 disabled:opacity-50"
            >
              {isLoading ? "Loading..." : "Load more"}
            </button>
          )}
        </>
      )}
    </div>
  );
}