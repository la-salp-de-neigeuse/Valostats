import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

export function Card({ children, className = "", hover = false, glow = false, padding = "md" }: CardProps) {
  const pad = padding === "none" ? "" : padding === "sm" ? "p-4" : padding === "lg" ? "p-8" : "p-6";
  return (
    <div
      className={`bg-surface border border-border rounded-xl ${pad} ${hover ? "hover-lift hover:bg-surface-hover/30" : "transition-colors"} ${glow ? "animate-pulse-glow" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
