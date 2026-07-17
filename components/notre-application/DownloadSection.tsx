"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface DownloadData {
  version: string;
  size: number;
  releaseNotes: string;
  publishedAt: string;
  filename: string;
  checksum: string | null;
}

export function DownloadSection() {
  const [data, setData] = useState<DownloadData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/download")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return "? Mo";
    const mb = bytes / (1024 * 1024);
    return mb >= 1 ? `${mb.toFixed(1)} Mo` : `${(bytes / 1024).toFixed(0)} Ko`;
  };

  return (
    <section id="download" className="py-20 lg:py-32 bg-surface/20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.03] via-transparent to-ai-purple/[0.03] pointer-events-none" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {!loading && data && (
          <Badge variant="premium" size="sm" className="mb-6">
            Version {data.version}
          </Badge>
        )}
        <h2 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight mb-4">
          Prêt à transformer votre expérience Valorant ?
        </h2>
        <p className="text-text-secondary max-w-xl mx-auto mb-10">
          Téléchargez ValoStats Companion et découvrez l&apos;overlay intelligent
          qui analyse vos parties en temps réel.
        </p>

        {!loading && data && data.size === 0 && (
          <Card className="mb-8 border-warning/20 bg-warning/5 text-left">
            <div className="p-4 text-sm text-text-secondary">
              <strong className="text-text-primary">Application disponible prochainement.</strong>
              <br />
              {data.releaseNotes}
            </div>
          </Card>
        )}

        <div className="flex flex-col items-center gap-6">
          {data && data.size > 0 ? (
            <Link
              href="/api/download?redirect=1"
              className={`group relative inline-flex items-center gap-3 h-16 px-10 text-lg font-bold rounded-xl bg-gradient-to-r from-accent to-accent-hover text-white shadow-glow hover:shadow-glow transition-all duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background`}
            >
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Télécharger ValoStats Companion
            </Link>
          ) : (
            <span className="group relative inline-flex items-center gap-3 h-16 px-10 text-lg font-bold rounded-xl bg-surface/50 text-text-muted cursor-not-allowed select-none">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Bientôt disponible
            </span>
          )}

          {data && data.size > 0 && (
            <div className="flex items-center gap-6 text-xs text-text-muted flex-wrap justify-center">
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Version {data.version}
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {formatSize(data.size)}
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Windows 10/11
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Signature numérique
              </span>
            </div>
          )}

          {!loading && data && data.releaseNotes && data.size > 0 && (
            <div className="mt-8 w-full max-w-2xl text-left">
              <details className="group bg-surface border border-border rounded-xl overflow-hidden">
                <summary className="px-6 py-4 text-sm font-semibold text-text-primary cursor-pointer hover:bg-surface-hover/30 transition-colors flex items-center justify-between">
                  <span>Notes de version</span>
                  <svg className="w-4 h-4 text-text-muted group-open:rotate-180 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </summary>
                <div className="px-6 pb-4">
                  <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                    {data.releaseNotes}
                  </div>
                  {data.checksum && (
                    <p className="mt-3 text-xs text-text-muted font-mono break-all">
                      SHA256: {data.checksum}
                    </p>
                  )}
                </div>
              </details>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
