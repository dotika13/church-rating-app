"use client";

import { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import { toast } from "sonner";
import { UploadIcon, XIcon, FileIcon, VideoIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCEPTED_TYPES = {
  "image/*": [".jpg", ".jpeg", ".png", ".webp", ".heic"],
  "video/*": [".mp4", ".webm", ".mov"]
};
const MAX_SIZE = 50 * 1024 * 1024; // 50MB

interface MediaUploaderProps {
  churchId: string;
}

interface QueuedFile {
  id: string;
  file: File;
  caption: string;
  progress: number;
  status: "pending" | "uploading" | "complete" | "error";
  error?: string;
}

export function MediaUploader({ churchId }: MediaUploaderProps) {
  const { uploadFile, isPending } = useMediaUpload(churchId);
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: QueuedFile[] = acceptedFiles.map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      caption: "",
      progress: 0,
      status: "pending"
    }));
    setQueuedFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_SIZE,
    noClick: false,
    noKeyboard: false
  });

  const handleUpload = async (fileData: QueuedFile) => {
    setQueuedFiles((prev) =>
      prev.map((f) => (f.id === fileData.id ? { ...f, status: "uploading" as const } : f))
    );

    try {
      await uploadFile(fileData.file, fileData.caption);
      setQueuedFiles((prev) =>
        prev.map((f) => (f.id === fileData.id ? { ...f, status: "complete" as const, progress: 100 } : f))
      );
      // Remove completed file after delay
      setTimeout(() => {
        setQueuedFiles((prev) => prev.filter((f) => f.id !== fileData.id));
      }, 1500);
      toast.success(`${fileData.file.name} uploaded`);
    } catch (error) {
      setQueuedFiles((prev) =>
        prev.map((f) =>
          f.id === fileData.id ? { ...f, status: "error" as const, error: error instanceof Error ? error.message : "Upload failed" } : f
        )
      );
    }
  };

  const handleUploadAll = () => {
    queuedFiles.filter((f) => f.status === "pending").forEach((f) => handleUpload(f));
  };

  const removeFile = (id: string) => {
    setQueuedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const updateCaption = (id: string, caption: string) => {
    setQueuedFiles((prev) => prev.map((f) => (f.id === id ? { ...f, caption } : f)));
  };

  const hasPendingFiles = queuedFiles.some((f) => f.status === "pending");

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "relative rounded-xl border-2 border-dashed p-8 text-center transition-colors",
          isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
        )}
      >
        <input {...getInputProps()} ref={fileInputRef} />
        <UploadIcon className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
        <p className="font-medium text-lg">Drag & drop images or videos</p>
        <p className="text-sm text-muted-foreground mt-1">
          Up to 50MB each • JPG, PNG, WebP, MP4, WebM, MOV
        </p>
      </div>

      {queuedFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{queuedFiles.length} file(s) queued</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleUploadAll} disabled={isPending || !hasPendingFiles}>
                Upload All
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setQueuedFiles([])} disabled={isPending}>
                Clear All
              </Button>
            </div>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {queuedFiles.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "flex items-center gap-4 p-3 rounded-lg border bg-card",
                  item.status === "error" && "border-destructive/50 bg-destructive/5"
                )}
              >
                {item.file.type.startsWith("video/") ? (
                  <VideoIcon className="w-10 h-10 text-primary flex-shrink-0" />
                ) : (
                  <FileIcon className="w-10 h-10 text-primary flex-shrink-0" />
                )}

                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm truncate">{item.file.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type="text"
                      placeholder="Caption (optional)"
                      value={item.caption}
                      onChange={(e) => updateCaption(item.id, e.target.value)}
                      className="flex-1 text-sm h-8"
                      disabled={item.status !== "pending"}
                    />
                    {item.status === "uploading" && (
                      <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    )}
                    {item.status === "complete" && (
                      <span className="text-sm text-green-600">✓ Done</span>
                    )}
                    {item.status === "error" && (
                      <span className="text-sm text-destructive">{item.error}</span>
                    )}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(item.id)}
                  disabled={item.status === "uploading"}
                  className="text-muted-foreground hover:text-destructive flex-shrink-0"
                >
                  <XIcon className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}