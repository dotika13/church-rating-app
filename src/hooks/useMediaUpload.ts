"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { toast } from "sonner";

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export function useMediaUpload(churchId: string) {
  const queryClient = useQueryClient();

  const getSignedUrl = useMutation({
    mutationFn: async (file: File) => {
      const res = await fetch(`/api/churches/${churchId}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mimeType: file.type, caption: "" })
      });
      if (!res.ok) throw new Error("Failed to get upload URL");
      return res.json();
    }
  });

  const uploadToStorage = useMutation({
    mutationFn: async ({ signedUrl, file, onProgress }: { signedUrl: string; file: File; onProgress?: (p: UploadProgress) => void }) => {
      const xhr = new XMLHttpRequest();
      return new Promise<void>((resolve, reject) => {
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable && onProgress) {
            onProgress({ loaded: e.loaded, total: e.total, percentage: (e.loaded / e.total) * 100 });
          }
        });
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Upload failed: ${xhr.status}`));
        });
        xhr.addEventListener("error", () => reject(new Error("Upload failed")));
        xhr.open("PUT", signedUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });
    }
  });

  const createRecord = useMutation({
    mutationFn: async ({ storagePath, mimeType, caption }: { storagePath: string; mimeType: string; caption?: string }) => {
      const res = await fetch(`/api/churches/${churchId}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storagePath, mimeType, caption })
      });
      if (!res.ok) throw new Error("Failed to create media record");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.churches.media(churchId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.churches.detail(churchId) });
      toast.success("Media uploaded");
    },
    onError: () => toast.error("Upload failed")
  });

  const uploadFile = async (file: File, caption?: string) => {
    const { data: { signedUrl, storagePath } } = await getSignedUrl.mutateAsync(file);
    await uploadToStorage.mutateAsync({ signedUrl, file, onProgress: (p) => console.log(p.percentage) });
    await createRecord.mutateAsync({ storagePath, mimeType: file.type, caption });
  };

  return { uploadFile, isPending: getSignedUrl.isPending || uploadToStorage.isPending || createRecord.isPending };
}

export function useDeleteMedia(churchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (mediaId: string) => {
      const res = await fetch(`/api/churches/${churchId}/media/${mediaId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete media");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.churches.media(churchId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.churches.detail(churchId) });
      toast.success("Media deleted");
    },
    onError: () => toast.error("Delete failed")
  });
}