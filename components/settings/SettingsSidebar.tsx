"use client";

import type { ReactNode } from "react";

interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
}

interface SettingsSidebarProps {
  items: NavItem[];
  active: string;
  onChange: (id: string) => void;
}

function SettingsSidebarDesktop({ items, active, onChange }: SettingsSidebarProps) {
  return (
    <nav className="hidden md:flex flex-col gap-1 w-56 shrink-0 sticky top-24 self-start">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onChange(item.id)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
            active === item.id
              ? "bg-accent-light text-accent border border-accent/30"
              : "text-text-muted hover:text-text-secondary hover:bg-surface-hover/50 border border-transparent"
          }`}
        >
          <span className="shrink-0 w-5 h-5">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </nav>
  );
}

function SettingsSidebarMobile({ items, active, onChange }: SettingsSidebarProps) {
  return (
    <nav className="md:hidden flex gap-1 overflow-x-auto pb-2 scrollbar-none" role="tablist">
      {items.map((item) => (
        <button
          key={item.id}
          role="tab"
          aria-selected={active === item.id}
          onClick={() => onChange(item.id)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
            active === item.id
              ? "bg-accent text-white shadow-glow"
              : "bg-surface border border-border text-text-muted hover:text-text-secondary"
          }`}
        >
          <span className="shrink-0 w-4 h-4">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </nav>
  );
}

export function SettingsSidebar(props: SettingsSidebarProps) {
  return (
    <>
      <SettingsSidebarDesktop {...props} />
      <SettingsSidebarMobile {...props} />
    </>
  );
}
