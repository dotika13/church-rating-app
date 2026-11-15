import { cn } from "@/lib/utils";
import { Church } from "@/db/schema";
import { DenominationPin } from "@/components/map/DenominationPin";

interface ChurchCardProps {
  church: Church & {
    ratingCount?: number;
    overallScore?: number;
    media?: Array<{ storagePath: string }>;
  };
  onClick: () => void;
  variant?: "default" | "compact";
}

export function ChurchCard({ church, onClick, variant = "default" }: ChurchCardProps) {
  const hasRating = church.ratingCount && church.ratingCount > 0;
  const score = hasRating ? church.overallScore?.toFixed(1) : null;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 rounded-xl border transition-all duration-200 hover:shadow-lg",
        "bg-card border-border",
        variant === "compact" && "p-3"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0 overflow-hidden rounded-lg bg-muted">
          {church.media?.[0] ? (
            <img
              src={`/api/media/proxy?path=${church.media[0].storagePath}&w=120&h=90&fit=cover`}
              alt={church.name}
              className="w-24 h-16 object-cover"
            />
          ) : (
            <div className="w-24 h-16 flex items-center justify-center">
              <DenominationPin denomination={church.denomination} size={32} />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-serif font-semibold text-lg truncate">{church.name}</h3>
            {church.denomination && (
              <DenominationPin denomination={church.denomination} size={20} />
            )}
          </div>
          {church.address && (
            <p className="text-sm text-muted-foreground truncate mt-1">{church.address}</p>
          )}
          <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
            {hasRating && (
              <span className="flex items-center gap-1 font-medium text-foreground">
                <svg className="w-4 h-4 text-gold-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                {score}
              </span>
            )}
            {church.ratingCount && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                {church.ratingCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}