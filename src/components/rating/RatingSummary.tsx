"use client";

import { Church } from "@/db/schema";
import { Rating } from "@/db/schema";
import { cn } from "@/lib/utils";
import { RatingStars } from "./RatingStars";
import { RatingForm } from "./RatingForm";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface RatingSummaryProps {
  church: Church & {
    ratingCount?: number;
    overallScore?: number;
    avgExterior?: number;
    avgInterior?: number;
    avgSurroundings?: number;
    avgAcoustics?: number;
    avgOrgan?: number;
    avgVibe?: number;
  };
  myRating?: Rating | null;
}

const CRITERIA_DISPLAY = [
  { key: "avgExterior", label: "Exterior" },
  { key: "avgInterior", label: "Interior" },
  { key: "avgSurroundings", label: "Surroundings" },
  { key: "avgAcoustics", label: "Acoustics" },
  { key: "avgVibe", label: "Vibe" }
] as const;

export function RatingSummary({ church, myRating }: RatingSummaryProps) {
  const [showForm, setShowForm] = useState(false);
  const hasRated = !!myRating;

  const overallScore = church.overallScore?.toFixed(1) || "—";
  const ratingCount = church.ratingCount || 0;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="font-serif text-4xl font-bold">{overallScore}</div>
        <div className="text-muted-foreground text-sm">
          {ratingCount} {ratingCount === 1 ? "rating" : "ratings"}
        </div>
        <RatingStars value={church.overallScore || 0} max={10} size="lg" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {CRITERIA_DISPLAY.map(({ key, label }) => (
          <div key={key} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-mono font-medium">
                {church[key] !== undefined && church[key] !== null ? church[key]!.toFixed(1) : "—"}
              </span>
            </div>
            <RatingStars value={church[key] || 0} max={10} size="sm" />
          </div>
        ))}
        {church.avgOrgan !== undefined && church.avgOrgan !== null && (
          <div className="col-span-2 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Organ</span>
              <span className="font-mono font-medium">{church.avgOrgan.toFixed(1)}</span>
            </div>
            <RatingStars value={church.avgOrgan} max={10} size="sm" />
          </div>
        )}
      </div>

      {hasRated && myRating && (
        <div className="border-t pt-4 space-y-3">
          <h4 className="font-medium">Your Rating</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {CRITERIA_DISPLAY.map(({ key, label }) => (
              <div key={key} className="flex justify-between">
                <span className="text-muted-foreground">{label}</span>
                <span>{(myRating as any)[key.replace("avg", "").toLowerCase()]}</span>
              </div>
            ))}
            {myRating.hasOrgan && myRating.organRating && (
              <div className="col-span-2 flex justify-between">
                <span className="text-muted-foreground">Organ</span>
                <span>{myRating.organRating}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {!showForm && (
        <Button
          className="w-full"
          variant={hasRated ? "outline" : "default"}
          onClick={() => setShowForm(true)}
        >
          {hasRated ? "Update Rating" : "Rate This Church"}
        </Button>
      )}

      {showForm && (
        <RatingForm
          churchId={church.id}
          initialData={myRating ? {
            exterior: myRating.exterior,
            interior: myRating.interior,
            surroundings: myRating.surroundings,
            acoustics: myRating.acoustics,
            hasOrgan: myRating.hasOrgan,
            organRating: myRating.organRating || undefined,
            vibe: myRating.vibe,
            visitDate: myRating.visitDate ? new Date(myRating.visitDate).toISOString().split("T")[0] : undefined,
            timeSpentMinutes: myRating.timeSpentMinutes || undefined,
            companionsReason: myRating.companionsReason || undefined
          } : undefined}
          onSuccess={() => setShowForm(false)}
        />
      )}
    </div>
  );
}