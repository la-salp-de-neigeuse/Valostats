"use client";

import { useRef, useEffect, useState } from "react";
import type { TeamMember } from "@/components/team/members";

interface ContributorCardProps {
  member: TeamMember;
  index: number;
}

export function ContributorCard({ member, index }: ContributorCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${index * 60}ms` }}
      className={`group relative bg-surface/50 backdrop-blur-sm border border-border rounded-xl p-3 flex items-center gap-3 transition-all duration-500 ease-out hover:border-border-accent hover:bg-surface-hover/50 ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4"
      }`}
    >
      <div className="w-9 h-9 rounded-full bg-gradient-brand-br flex items-center justify-center text-white text-sm font-bold shrink-0 transition-transform duration-300 group-hover:scale-110">
        {member.pseudo.charAt(0).toUpperCase()}
      </div>

      <div className="min-w-0">
        <p className="text-sm font-semibold text-text-primary truncate">
          {member.pseudo}
        </p>
        <p
          className="text-xs font-medium"
          style={{ color: "rgba(148,163,184,0.9)" }}
        >
          {member.role}
        </p>
      </div>
    </div>
  );
}
