"use client";

import { useRef, useEffect, useState } from "react";
import type { TeamMember, TeamCategory } from "@/components/team/members";

interface TeamCardProps {
  member: TeamMember;
  index: number;
}

const BADGE_COLORS: Record<TeamCategory, { bg: string; text: string; border: string }> = {
  "co-founder": { bg: "rgba(255,70,85,0.12)", text: "#FF4655", border: "rgba(255,70,85,0.25)" },
  developers: { bg: "rgba(56,189,248,0.12)", text: "#38BDF8", border: "rgba(56,189,248,0.25)" },
  designers: { bg: "rgba(168,85,247,0.12)", text: "#A855F7", border: "rgba(168,85,247,0.25)" },
  moderators: { bg: "rgba(34,197,94,0.12)", text: "#22C55E", border: "rgba(34,197,94,0.25)" },
  testers: { bg: "rgba(245,158,11,0.12)", text: "#F59E0B", border: "rgba(245,158,11,0.25)" },
  contributors: { bg: "rgba(148,163,184,0.12)", text: "#94A3B8", border: "rgba(148,163,184,0.25)" },
};

function AvatarLetter({ pseudo }: { pseudo: string }) {
  const letter = pseudo.charAt(0).toUpperCase();
  return (
    <div className="w-20 h-20 rounded-full bg-gradient-brand-br flex items-center justify-center text-white text-2xl font-bold shrink-0 shadow-lg shadow-accent-glow">
      {letter}
    </div>
  );
}

export function TeamCard({ member, index }: TeamCardProps) {
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

  const colors = BADGE_COLORS[member.category];

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${index * 80}ms` }}
      className={`group relative bg-surface/70 backdrop-blur-sm border border-border rounded-2xl p-6 flex flex-col items-center text-center transition-all duration-500 ease-out ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-6"
      }`}
    >
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-accent/[0.03] to-ai-purple/[0.03] pointer-events-none" />

      <div className="relative mb-5 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1">
        <AvatarLetter pseudo={member.pseudo} />
      </div>

      <h3 className="relative text-lg font-bold text-text-primary mb-1">
        {member.pseudo}
      </h3>

      {member.description && (
        <p className="relative text-sm text-text-muted leading-relaxed mb-5">
          {member.description}
        </p>
      )}

      <div className="relative mt-auto">
        <span
          className="inline-block px-3.5 py-1 text-xs font-semibold rounded-full border"
          style={{
            backgroundColor: colors.bg,
            color: colors.text,
            borderColor: colors.border,
          }}
        >
          {member.role}
        </span>
      </div>
    </div>
  );
}
