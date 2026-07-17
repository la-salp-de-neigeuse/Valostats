"use client";

import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";

export function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [version, setVersion] = useState("...");
  const [downloadUrl, setDownloadUrl] = useState("/downloads/ValoStats-Setup-1.0.0.exe");
  const [filename, setFilename] = useState("ValoStats-Setup-1.0.0.exe");

  useEffect(() => {
    fetch("/api/download")
      .then((r) => r.json())
      .then((data) => {
        setVersion(data.version || "...");
        if (data.url) setDownloadUrl(data.url);
        if (data.filename) setFilename(data.filename);
      })
      .catch(() => setVersion("..."));
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const sp = window.scrollY;
      const opacity = Math.max(0, 1 - sp / 600);
      const y = sp * 0.15;
      el.style.setProperty("opacity", String(opacity));
      el.style.setProperty("transform", `translateY(${y}px)`);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-24 pb-20">
      <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-background pointer-events-none" />
      <div
        ref={ref}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-accent/10 blur-[120px] pointer-events-none"
      />
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fade-in">
          <Badge variant="premium" size="sm" className="mb-6">
            Version {version} — Application companion
          </Badge>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-text-primary tracking-tight leading-[1.1] animate-slide-up">
          ValoStats{" "}
          <span className="bg-gradient-to-r from-accent to-ai-purple bg-clip-text text-transparent">
            Companion
          </span>
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: "0.1s" }}>
          L&apos;application desktop qui transforme votre expérience Valorant.
          Overlay intelligent, analyse IA en temps réel et détection automatique
          des parties — le tout sans effort.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <a
            href={downloadUrl}
            download={filename}
            className="group relative inline-flex items-center gap-3 h-14 px-8 text-base font-bold rounded-xl bg-accent text-white shadow-glow hover:shadow-glow hover:bg-accent-hover transition-all duration-300 hover-scale"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Télécharger ValoStats Companion
          </a>
          <a
            href="#features"
            className="inline-flex items-center gap-2 h-14 px-8 text-base font-semibold rounded-xl bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-accent/50 transition-all duration-300 hover-scale"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
            En savoir plus
          </a>
        </div>
        <div className="mt-16 flex items-center justify-center gap-8 text-sm text-text-muted animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Windows 10/11
          </span>
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Installation rapide
          </span>
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Gratuit
          </span>
        </div>
      </div>
    </section>
  );
}
