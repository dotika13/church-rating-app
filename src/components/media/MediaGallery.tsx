"use client";

import { useState } from "react";
import { MediaItem } from "./MediaItem";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { PlusIcon, GridIcon, ListIcon } from "lucide-react";

interface MediaGalleryProps {
  media: Array<{
    id: string;
    storagePath: string;
    mimeType: string;
    caption: string | null;
    createdAt: string;
  }>;
  churchId: string;
  onUploadClick?: () => void;
  onMediaClick?: (media: MediaGalleryProps["media"][number]) => void;
}

export function MediaGallery({ media, churchId, onUploadClick, onMediaClick }: MediaGalleryProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedMedia, setSelectedMedia] = useState<MediaGalleryProps["media"][number] | null>(null);

  const handleMediaClick = (item: MediaGalleryProps["media"][number]) => {
    if (onMediaClick) {
      onMediaClick(item);
    } else {
      setSelectedMedia(item);
    }
  };

  if (media.length === 0) {
    return (
      <div className="text-center py-12 border rounded-xl bg-muted/50">
        <p className="text-muted-foreground mb-4">No media uploaded yet</p>
        {onUploadClick && (
          <Button onClick={onUploadClick} className="w-full max-w-xs">
            <PlusIcon className="w-4 h-4 mr-2" />
            Upload Media
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{media.length} media item{media.length !== 1 ? "s" : ""}</h3>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
            className="h-8 w-8"
            aria-label="Grid view"
          >
            <GridIcon className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
            className="h-8 w-8"
            aria-label="List view"
          >
            <ListIcon className="w-4 h-4" />
          </Button>
          {onUploadClick && (
            <Button onClick={onUploadClick} className="ml-2" size="sm">
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Media
            </Button>
          )}
        </div>
      </div>

      {viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {media.map((item) => (
            <MediaItem key={item.id} media={item} churchId={churchId} onClick={() => handleMediaClick(item)} variant="grid" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {media.map((item) => (
            <MediaItem key={item.id} media={item} churchId={churchId} onClick={() => handleMediaClick(item)} variant="list" />
          ))}
        </div>
      )}

      {selectedMedia && (
        <MediaModal media={selectedMedia} onClose={() => setSelectedMedia(null)} />
      )}
    </div>
  );
}

function MediaModal({ media, onClose }: { media: MediaGalleryProps["media"][number]; onClose: () => void }) {
  const isVideo = media.mimeType.startsWith("video/");
  const isImage = media.mimeType.startsWith("image/");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={onClose}>
      <div className="relative max-w-4xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
        >
          <span className="sr-only">Close</span>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>

        {isImage && (
          <Image
            src={`/api/media/${media.storagePath}`}
            alt={media.caption || "Church media"}
            fill
            className="object-contain rounded-lg"
            priority
            sizes="90vw"
          />
        )}

        {isVideo && (
          <video className="w-full max-h-[80vh] rounded-lg" controls autoPlay>
            <source src={`/api/media/${media.storagePath}`} type={media.mimeType} />
            Your browser does not support the video tag.
          </video>
        )}

        {media.caption && (
          <div className="mt-4 text-center text-white/90">
            <p className="text-lg">{media.caption}</p>
            <p className="text-sm text-white/60 mt-1">{new Date(media.createdAt).toLocaleDateString()}</p>
          </div>
        )}
      </div>
    </div>
  );
}