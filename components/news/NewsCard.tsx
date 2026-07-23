"use client";

import { useState } from "react";
import type { NewsArticle } from "@/services/news/types";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function Placeholder() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-surface-hover/60 to-surface-hover flex items-center justify-center">
      <svg className="w-14 h-14 text-text-muted/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    </div>
  );
}

export function NewsCard({ article }: { article: NewsArticle }) {
  const [imgError, setImgError] = useState(false);

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group bg-surface border border-border/80 rounded-xl overflow-hidden flex flex-col transition-all duration-200 hover:border-accent/40 hover:shadow-glow"
    >
      <div className="relative aspect-video bg-surface-hover overflow-hidden">
        {article.imageUrl && !imgError ? (
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <Placeholder />
        )}
      </div>

      <div className="flex-1 flex flex-col p-5">
        <div className="flex items-center gap-2 mb-2">
          {article.category && (
            <span className="text-[11px] font-semibold uppercase tracking-wider text-accent">
              {article.category}
            </span>
          )}
          {article.publishedAt && (
            <span className="text-[11px] text-text-muted/60 ml-auto">
              {formatDate(article.publishedAt)}
            </span>
          )}
        </div>

        <h3 className="text-sm font-semibold text-text-primary leading-snug mb-2 line-clamp-2 group-hover:text-accent transition-colors">
          {article.title}
        </h3>

        {article.description && (
          <p className="text-xs text-text-muted/80 leading-relaxed line-clamp-2 mb-3">
            {article.description}
          </p>
        )}

        <div className="mt-auto flex items-center gap-2 flex-wrap">
          {article.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded-full bg-surface-hover/50 text-text-muted/70 border border-border/50"
            >
              {tag}
            </span>
          ))}
          <span className="text-[11px] text-accent ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            Voir plus
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </a>
  );
}
