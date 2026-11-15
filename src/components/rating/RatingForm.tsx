"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Slider } from "./Slider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ratingSchema, RatingInput } from "@/lib/validation/rating";
import { queryKeys } from "@/lib/query/keys";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface RatingFormProps {
  churchId: string;
  initialData?: Partial<RatingInput>;
  onSuccess?: () => void;
}

const CRITERIA = [
  { key: "exterior", label: "Exterior" },
  { key: "interior", label: "Interior" },
  { key: "surroundings", label: "Surroundings" },
  { key: "acoustics", label: "Acoustics" },
  { key: "vibe", label: "Vibe" }
] as const;

export function RatingForm({ churchId, initialData, onSuccess }: RatingFormProps) {
  const queryClient = useQueryClient();
  const [hasOrgan, setHasOrgan] = useState(initialData?.hasOrgan || false);
  const [organRating, setOrganRating] = useState(initialData?.organRating || 5);

  const form = useForm<RatingInput>({
    resolver: zodResolver(ratingSchema),
    defaultValues: {
      exterior: 5,
      interior: 5,
      surroundings: 5,
      acoustics: 5,
      vibe: 5,
      hasOrgan: false,
      organRating: null,
      visitDate: new Date().toISOString().split("T")[0],
      timeSpentMinutes: 60,
      companionsReason: "",
      ...initialData
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: RatingInput) => {
      const res = await fetch(`/api/churches/${churchId}/ratings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to save rating");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.churches.detail(churchId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.churches.ratings(churchId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.ratings.mine(churchId) });
      toast.success("Rating saved");
      onSuccess?.();
    },
    onError: () => toast.error("Failed to save rating")
  });

  const onSubmit = form.handleSubmit((data) => {
    mutation.mutate({ ...data, hasOrgan, organRating: hasOrgan ? organRating : null });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-4">
        <h4 className="font-serif text-lg font-semibold">Architecture & Setting</h4>
        {CRITERIA.map(({ key, label }) => (
          <Slider
            key={key}
            label={label}
            value={form.watch(key)}
            onValueChange={([v]) => form.setValue(key, v, { shouldValidate: true })}
          />
        ))}
      </div>

      <div className="space-y-4 border-t pt-6">
        <div className="flex items-center justify-between">
          <label className="font-medium">Pipe Organ</label>
          <Switch
            checked={hasOrgan}
            onCheckedChange={setHasOrgan}
            aria-label="Has pipe organ"
          />
        </div>
        {hasOrgan && (
          <Slider
            label="Organ Rating"
            value={organRating}
            onValueChange={([v]) => setOrganRating(v)}
          />
        )}
      </div>

      <div className="space-y-4 border-t pt-6">
        <div>
          <Label htmlFor="visitDate">Visit Date</Label>
          <Input
            id="visitDate"
            type="date"
            max={new Date().toISOString().split("T")[0]}
            {...form.register("visitDate")}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="timeSpent">Time Spent (minutes)</Label>
          <Input
            id="timeSpent"
            type="number"
            min="0"
            step="15"
            {...form.register("timeSpentMinutes", { valueAsNumber: true })}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="companionsReason">Kivel és miért mentél</Label>
          <Textarea
            id="companionsReason"
            {...form.register("companionsReason")}
            rows={3}
            placeholder="With whom and why did you visit?"
            className="mt-1"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t pt-6">
        <Button type="button" variant="outline" onClick={onSuccess ?? (() => {})}>Cancel</Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : "Save Rating"}
        </Button>
      </div>
    </form>
  );
}