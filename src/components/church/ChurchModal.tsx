"use client";

import { useEffect } from "react";
import { Dialog, DialogContent, DialogClose, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Church } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ChurchModalProps {
  church: (Church & {
    ratingCount?: number;
    overallScore?: number;
    avgExterior?: number;
    avgInterior?: number;
    avgSurroundings?: number;
    avgAcoustics?: number;
    avgOrgan?: number;
    avgVibe?: number;
    ratings?: any[];
    media?: any[];
  }) | null;
  onClose: () => void;
}

export function ChurchModal({ church, onClose }: ChurchModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!church) return null;

  const hasRating = church.ratingCount && church.ratingCount > 0;
  const score = hasRating ? church.overallScore?.toFixed(1) : null;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className={cn("max-w-2xl max-h-[90vh] p-0", "sm:max-w-3xl")}>
        <DialogHeader className="border-b p-4 pb-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="font-serif text-2xl">{church.name}</DialogTitle>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                {church.denomination && (
                  <span className="px-2 py-0.5 rounded bg-secondary text-xs font-medium capitalize">
                    {church.denomination}
                  </span>
                )}
                {church.address && <span>{church.address}</span>}
                {hasRating && score && (
                  <span className="flex items-center gap-1 font-medium text-foreground">
                    <svg className="w-4 h-4 text-gold-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    {score} ({church.ratingCount} reviews)
                  </span>
                )}
              </div>
            </div>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="flex-1 overflow-hidden">
          <TabsList className="border-b px-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="ratings">Ratings</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="p-4 overflow-y-auto">
            <ScrollArea className="h-[50vh]">
              <div className="space-y-4">
                {church.description && <p className="text-muted-foreground">{church.description}</p>}
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  {church.yearBuilt && (<><dt className="text-muted-foreground">Year Built</dt><dd>{church.yearBuilt}</dd></>)}
                  {church.architecturalStyle && (<><dt className="text-muted-foreground">Style</dt><dd className="capitalize">{church.architecturalStyle.replace("_", " ")}</dd></>)}
                  {church.heritageStatus && church.heritageStatus !== "none" && (<><dt className="text-muted-foreground">Heritage</dt><dd className="capitalize">{church.heritageStatus}</dd></>)}
                  {church.capacity && (<><dt className="text-muted-foreground">Capacity</dt><dd>{church.capacity}</dd></>)}
                  {church.organBuilder && (<><dt className="text-muted-foreground">Organ Builder</dt><dd>{church.organBuilder}</dd></>)}
                  {church.website && (<><dt className="text-muted-foreground">Website</dt><dd><a href={church.website} target="_blank" rel="noopener" className="text-primary underline">{church.website}</a></dd></>)}
                  {church.serviceTimes && (<><dt className="text-muted-foreground">Service Times</dt><dd>{church.serviceTimes}</dd></>)}
                  {church.wheelchairAccessible && (<><dt className="text-muted-foreground">Accessible</dt><dd>Yes</dd></>)}
                  {church.parkingInfo && (<><dt className="text-muted-foreground">Parking</dt><dd>{church.parkingInfo}</dd></>)}
                </dl>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="ratings" className="p-4 overflow-y-auto">
            <div className="space-y-4 text-center py-8">
              <p className="text-muted-foreground">Ratings tab - coming soon</p>
              <p className="text-sm text-muted-foreground">Sign in to rate this church</p>
              <Link href="/login" className="inline-block mt-4">
                <Button>Sign In to Rate</Button>
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="media" className="p-4 overflow-y-auto">
            <div className="space-y-4 text-center py-8">
              {church.media && church.media.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {church.media.map((m: any, i: number) => (
                    <div key={i} className="aspect-video rounded-lg overflow-hidden bg-muted">
                      <img
                        src={`/api/media/proxy?path=${m.storagePath}&w=400&h=300&fit=cover`}
                        alt={`${church.name} ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No media uploaded yet</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}