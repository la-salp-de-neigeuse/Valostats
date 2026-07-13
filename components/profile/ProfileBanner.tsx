"use client";

import { useRef, useState } from "react";

interface ProfileBannerProps {
  bannerUrl: string | null;
  onBannerChange: (url: string | null) => void;
  onToast: (variant: "success" | "error", title: string, description?: string) => void;
}

function resizeImage(dataUrl: string, maxWidth: number, maxHeight: number, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      if (width > maxWidth) { height *= maxWidth / width; width = maxWidth; }
      if (height > maxHeight) { width *= maxHeight / height; height = maxHeight; }
      canvas.width = Math.round(width);
      canvas.height = Math.round(height);
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

export function ProfileBanner({ bannerUrl, onBannerChange, onToast }: ProfileBannerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      onToast("error", "Fichier trop volumineux", "La bannière ne doit pas dépasser 5 Mo.");
      return;
    }
    setUploading(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const resized = await resizeImage(dataUrl, 1200, 350, 0.85);
      const res = await fetch("/api/user/profile/banner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banner: resized }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de l'upload.");
      }
      onBannerChange(resized);
      onToast("success", "Bannière mise à jour");
    } catch (err) {
      onToast("error", "Erreur", err instanceof Error ? err.message : "Impossible d'uploader la bannière.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleDelete() {
    setUploading(true);
    try {
      const res = await fetch("/api/user/profile/banner", { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur lors de la suppression.");
      onBannerChange(null);
      onToast("success", "Bannière supprimée");
    } catch (err) {
      onToast("error", "Erreur", err instanceof Error ? err.message : "Impossible de supprimer la bannière.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="relative w-full h-64 md:h-72 rounded-3xl overflow-hidden bg-gradient-to-br from-accent/30 via-surface to-surface">
      {bannerUrl && (
        <img
          src={bannerUrl}
          alt="Bannière du profil"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />

      <div className="absolute bottom-4 right-4 flex gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFile}
        />
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-background/80 backdrop-blur-sm border border-border text-text-secondary hover:text-text-primary hover:border-border-hover rounded-lg text-xs font-medium transition-all disabled:opacity-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          {uploading ? "Upload..." : "Changer la bannière"}
        </button>
        {bannerUrl && (
          <button
            onClick={handleDelete}
            disabled={uploading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 backdrop-blur-sm border border-red-500/30 text-red-400 hover:text-red-300 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            Supprimer
          </button>
        )}
      </div>
    </div>
  );
}
