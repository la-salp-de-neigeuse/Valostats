import type { ReactNode } from "react";

interface DashboardHeroProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

export function DashboardHero({ title, description, children }: DashboardHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0d0d14] via-[#111118] to-[#0a0a0e] border border-border/80 p-7 sm:p-9">
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/[0.04] rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/[0.03] rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 w-px h-32 bg-gradient-to-b from-accent/10 via-accent/5 to-transparent pointer-events-none" />
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">{title}</h1>
          {description && <p className="text-sm text-text-muted/80">{description}</p>}
        </div>
        {children && <div className="flex items-center gap-3 flex-wrap">{children}</div>}
      </div>
    </div>
  );
}
