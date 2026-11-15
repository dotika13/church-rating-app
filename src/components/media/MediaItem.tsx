"use client";

import { Button } from "@/components/ui/button";
import { useDeleteMedia } from "@/hooks/useMediaUpload";
import { XIcon, ExpandIcon, VideoIcon } from "lucide-react";
import Image from "next/image";

interface MediaItemProps {
  media: {
    id: string;
    storagePath: string;
    mimeType: string;
    caption: string | null;
    createdAt: string;
  };
  churchId: string;
  onClick?: () => void;
  variant?: "grid" | "list";
}

export function MediaItem({ media, churchId, onClick, variant = "grid" }: MediaItemProps) {
  const deleteMedia = useDeleteMedia(churchId);
  const isVideo = media.mimeType.startsWith("video/");
  const isImage = media.mimeType.startsWith("image/");

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this media?")) return;
    await deleteMedia.mutateAsync(media.id);
  };

  const handleClick = () => {
    if (onClick) onClick();
  };

  if (variant === "list") {
    return (
      <div className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer" onClick={handleClick}>
        <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
          {isImage && (
            <Image
              src={`/api/media/${media.storagePath}`}
              alt={media.caption || "Church media"}
              fill
              className="object-cover"
              sizes="80px"
            />
          )}
          {isVideo && (
            <div className="flex items-center justify-center h-full text-primary">
              <VideoIcon className="w-8 h-8" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-mono text-sm truncate">{media.caption || "No caption"}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(media.createdAt).toLocaleDateString()} • {isVideo ? "Video" : "Image"}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={handleDelete} disabled={deleteMedia.isPending} className="text-muted-foreground hover:text-destructive">
          <XIcon className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="group relative rounded-xl overflow-hidden border bg-card cursor-pointer" onClick={handleClick}>
      <div className="relative aspect-square overflow-hidden">
        {isImage && (
          <Image
            src={`/api/media/${media.storagePath}`}
            alt={media.caption || "Church media"}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        )}
        {isVideo && (
          <div className="flex items-center justify-center h-full bg-muted text-primary">
            <VideoIcon className="w-16 h-16" />
          </div>
        )}

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <ExpandIcon className="w-8 h-8 text-white" />
        </div>

        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            disabled={deleteMedia.isPending}
            className="bg-black/50 hover:bg-destructive text-white hover:text-white"
          >
            <XIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {media.caption && (
        <div className="p-3">
          <p className="text-sm line-clamp-2">{media.caption}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {new Date(media.createdAt).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
}