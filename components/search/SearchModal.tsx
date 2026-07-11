"use client";

import { useState, useEffect, useRef } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useRouter } from "next/navigation";
import type { SearchResult } from "@/services/search/types";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  pages: "Pages",
  joueurs: "Joueurs",
  equipes: "Équipes",
  matchs: "Matchs",
  notifications: "Notifications",
  objectifs: "Objectifs",
};

export function SearchModal({ open, onClose }: SearchModalProps) {
  if (!open) return null;

  return <SearchModalInner key={"open"} onClose={onClose} />;
}

function SearchModalInner({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 200);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (debouncedQuery.length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}&limit=10`)
        .then((res) => {
          if (!res.ok) return;
          return res.json();
        })
        .then((data) => {
          setResults(data?.results ?? []);
          setSelectedIndex(-1);
        })
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 0);
    return () => clearTimeout(timer);
  }, [debouncedQuery]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
      return;
    }

    if (e.key === "Enter" && selectedIndex >= 0 && selectedIndex < results.length) {
      navigate(results[selectedIndex]);
      return;
    }
  };

  const navigate = (result: SearchResult) => {
    onClose();
    router.push(result.href);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-2xl mx-4 bg-[#0d0d10] border border-slate-800 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800">
          <svg className="w-5 h-5 shrink-0 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher..."
            className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none text-base"
            autoComplete="off"
            spellCheck={false}
          />
          {loading && (
            <svg className="w-4 h-4 animate-spin text-slate-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs text-slate-500 bg-slate-800/50 rounded-md border border-slate-700/50">
            ESC
          </kbd>
        </div>

        <div ref={listRef} className="max-h-96 overflow-y-auto py-2" role="listbox">
          {query.length < 2 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-slate-600">Tapez au moins 2 caractères pour lancer la recherche</p>
            </div>
          ) : results.length === 0 && !loading ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-slate-600">Aucun résultat pour <span className="text-slate-400 font-medium">&ldquo;{query}&rdquo;</span></p>
            </div>
          ) : (
            groupByCategory(results).map(([category, items]) => (
              <div key={category}>
                <div className="px-5 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {CATEGORY_LABELS[category] ?? category}
                </div>
                {items.map((item) => {
                  const absoluteIndex = results.indexOf(item);
                  return (
                    <button
                      key={item.id}
                      role="option"
                      aria-selected={selectedIndex === absoluteIndex}
                      onClick={() => navigate(item)}
                      onMouseEnter={() => setSelectedIndex(absoluteIndex)}
                      className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors ${
                        selectedIndex === absoluteIndex
                          ? "bg-rose-500/10 text-white"
                          : "text-slate-300 hover:bg-slate-800/30"
                      }`}
                    >
                      <span className="text-lg shrink-0">{item.icon}</span>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-medium truncate ${selectedIndex === absoluteIndex ? "text-white" : ""}`}>
                          {item.label}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{item.description}</p>
                      </div>
                      {item.badge && (
                        <span className="shrink-0 text-xs text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="flex items-center gap-4 px-5 py-2.5 border-t border-slate-800/50 text-xs text-slate-600">
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-800/50 rounded border border-slate-700/50">↑↓</kbd>
            <span>Naviguer</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-800/50 rounded border border-slate-700/50">↵</kbd>
            <span>Ouvrir</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-800/50 rounded border border-slate-700/50">ESC</kbd>
            <span>Fermer</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function groupByCategory(results: SearchResult[]): [string, SearchResult[]][] {
  const map = new Map<string, SearchResult[]>();
  for (const r of results) {
    const existing = map.get(r.category) ?? [];
    existing.push(r);
    map.set(r.category, existing);
  }
  return Array.from(map.entries());
}
