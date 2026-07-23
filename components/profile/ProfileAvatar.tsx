"use client";

import { useState, useRef } from "react";
import { PlaceholderAvatar } from "@/components/ui/placeholder-avatar";

interface ProfileAvatarProps {
  image: string | null;
  name: string | null;
  onAvatarChange: (url: string) => void;
  onToast: (variant: "success" | "error", title: string, description?: string) => void;
}

function resizeImage(dataUrl: string, maxSize: number, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const size = Math.min(img.width, img.height, maxSize);
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      const offsetX = (img.width - size) / 2;
      const offsetY = (img.height - size) / 2;
      ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, size, size);
      resolve(canvas.toDataURL("image/webp", quality));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

export function ProfileAvatar({ image, name, onAvatarChange, onToast }: ProfileAvatarProps) {
  const [uploading, setUploading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      onToast("error", "Fichier trop volumineux", "L'image ne doit pas dépasser 5 Mo.");
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

      const resized = await resizeImage(dataUrl, 400, 0.85);

      const res = await fetch("/api/user/profile/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: resized }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de l'upload.");
      }

      onAvatarChange(resized);
      onToast("success", "Avatar mis à jour");
    } catch (err) {
      onToast("error", "Erreur", err instanceof Error ? err.message : "Impossible de mettre à jour l'avatar.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="relative group">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="block rounded-full focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
        aria-label="Modifier l'avatar"
      >
        {image && !imgError ? (
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-border">
            <img
              key={image}
              src={image}
              alt={name || ""}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          </div>
        ) : (
          <PlaceholderAvatar size="5xl" className="border-2 border-border" />
        )}
      </button>

      <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleFile}
      />

      {uploading && (
        <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
