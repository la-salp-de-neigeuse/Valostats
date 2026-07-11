"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RiotPlatform } from "@prisma/client";

export function LinkRiotForm({ 
  onCancel, 
  onSuccess 
}: { 
  onCancel?: () => void;
  onSuccess?: () => void;
}) {
  const [gameName, setGameName] = useState("");
  const [tagLine, setTagLine] = useState("");
  const [platform, setPlatform] = useState<RiotPlatform>(RiotPlatform.EUW1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/riot/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameName, tagLine, platform }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Une erreur est survenue");
      }

      router.refresh();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Une erreur est survenue");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 w-full text-left">
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium text-slate-400 mb-1.5 block">Game Name</label>
          <Input 
            placeholder="Ex: Player One" 
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            required
            minLength={1}
            maxLength={30}
          />
        </div>
        <div className="w-28">
          <label className="text-sm font-medium text-slate-400 mb-1.5 block">Tagline</label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-500">#</span>
            <Input 
              className="pl-7" 
              placeholder="EUW"
              value={tagLine}
              onChange={(e) => setTagLine(e.target.value.replace(/^#/, '').replace(/\s/g, ''))}
              required
              minLength={1}
              maxLength={5}
            />
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-400 mb-1.5 block">Région</label>
        <select 
          className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0c]"
          value={platform}
          onChange={(e) => setPlatform(e.target.value as RiotPlatform)}
        >
          <option value="EUW1">Europe West (EUW)</option>
          <option value="EUN1">Europe Nordic & East (EUNE)</option>
          <option value="NA1">North America (NA)</option>
          <option value="KR">Korea (KR)</option>
          <option value="BR1">Brazil (BR)</option>
          <option value="LA1">Latin America North (LAN)</option>
          <option value="LA2">Latin America South (LAS)</option>
          <option value="JP1">Japan (JP)</option>
          <option value="OC1">Oceania (OCE)</option>
          <option value="TR1">Turkey (TR)</option>
        </select>
      </div>

      {error && <p className="text-sm text-rose-500">{error}</p>}

      <div className="flex gap-3 pt-2">
        {onCancel && (
          <button 
            type="button" 
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            Annuler
          </button>
        )}
        <Button type="submit" isLoading={isLoading} className="flex-1 bg-rose-500 hover:bg-rose-600">
          Enregistrer
        </Button>
      </div>
    </form>
  );
}
