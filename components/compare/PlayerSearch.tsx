"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { PlayerSearchResult } from "@/services/comparison/types";

function SearchInput({
  label,
  value,
  onSelect,
}: {
  label: string;
  value: string;
  onSelect: (result: PlayerSearchResult) => void;
}) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<PlayerSearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/compare/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data: PlayerSearchResult[] = await res.json();
        setResults(data);
        setOpen(true);
      }
    } catch {
      // silence
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const q = e.target.value;
      setQuery(q);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => doSearch(q), 300);
    },
    [doSearch],
  );

  const handleSelect = useCallback(
    (r: PlayerSearchResult) => {
      setQuery(r.displayName);
      setOpen(false);
      onSelect(r);
    },
    [onSelect],
  );

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative flex-1">
      <label className="block text-sm text-slate-400 mb-1">{label}</label>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Rechercher par nom ou Riot ID..."
        className="w-full bg-background border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-accent transition-colors"
      />
      {loading && (
        <span className="absolute right-3 top-9 text-xs text-slate-500">Recherche...</span>
      )}
      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-surface border border-slate-700 rounded-xl shadow-xl max-h-60 overflow-y-auto">
          {results.map((r) => (
            <button
              key={r.publicSlug}
              onClick={() => handleSelect(r)}
              className="w-full text-left px-4 py-3 text-sm text-slate-200 hover:bg-slate-800/50 transition-colors flex items-center justify-between"
            >
              <span>
                <span className="font-medium">{r.gameName ?? r.displayName}</span>
                {r.tagLine && <span className="text-slate-500">#{r.tagLine}</span>}
              </span>
              {r.rank && <span className="text-xs text-slate-500">{r.rank}</span>}
            </button>
          ))}
        </div>
      )}
      {open && results.length === 0 && query.length >= 2 && !loading && (
        <div className="absolute z-50 mt-1 w-full bg-surface border border-slate-700 rounded-xl shadow-xl p-4 text-center text-sm text-slate-500">
          Aucun joueur trouvé
        </div>
      )}
    </div>
  );
}

export function PlayerSearch() {
  const router = useRouter();
  const [p1, setP1] = useState<PlayerSearchResult | null>(null);
  const [p2, setP2] = useState<PlayerSearchResult | null>(null);

  const canCompare = p1 && p2 && p1.publicSlug !== p2.publicSlug;

  const handleCompare = useCallback(() => {
    if (!canCompare) return;
    router.push(`/compare?p1=${p1.publicSlug}&p2=${p2.publicSlug}`);
  }, [canCompare, p1, p2, router]);

  return (
    <div className="bg-surface border border-slate-800 rounded-2xl p-6">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <SearchInput
          label="Joueur 1"
          value={p1?.displayName ?? ""}
          onSelect={setP1}
        />
        <span className="text-slate-500 text-sm py-2 md:py-3">VS</span>
        <SearchInput
          label="Joueur 2"
          value={p2?.displayName ?? ""}
          onSelect={setP2}
        />
        <button
          onClick={handleCompare}
          disabled={!canCompare}
          className="w-full md:w-auto bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium px-6 py-3 rounded-xl transition-colors"
        >
          Comparer
        </button>
      </div>
    </div>
  );
}
