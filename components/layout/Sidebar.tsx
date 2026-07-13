"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { NAV_ITEMS, ABOUT_ITEMS } from "./nav-items";
import { Logo } from "@/components/ui/logo";
import { UpgradeButton } from "@/components/subscription/UpgradeButton";
import { canViewAdminPanel } from "@/services/roles/types";

const STORAGE_KEY = "sidebar:about:expanded";

function ShieldIcon() {
  return (
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  const [aboutOpen, setAboutOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEY) === "true";
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(aboutOpen));
  }, [aboutOpen]);

  const isAboutActive = ABOUT_ITEMS.some((item) => pathname === item.href || pathname.startsWith(item.href + "/"));

  return (
    <aside aria-label="Navigation latérale" className="w-64 bg-background border-r border-border hidden md:flex flex-col shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Logo href="/dashboard" size={32} textClassName="text-lg" />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Pages">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "text-accent bg-accent-light shadow-card"
                  : "text-text-muted hover:text-text-secondary hover:bg-surface-hover/50"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}

        {/* À propos dropdown */}
        <div className="pt-3">
          <button
            onClick={() => setAboutOpen((prev) => !prev)}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              isAboutActive
                ? "text-accent bg-accent-light shadow-card"
                : "text-text-muted hover:text-text-secondary hover:bg-surface-hover/50"
            }`}
            aria-expanded={aboutOpen}
          >
            <InfoIcon />
            <span>À propos</span>
            <ChevronIcon className={`w-4 h-4 ml-auto transition-transform duration-200 ${aboutOpen ? "rotate-180" : ""}`} />
          </button>

          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              aboutOpen ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0 scale-y-95"
            }`}
          >
            <div className="ml-2 space-y-0.5 border-l border-border pl-3">
              {ABOUT_ITEMS.map((item) => {
                const isItemActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                      isItemActive
                        ? "text-accent bg-accent-light/50"
                        : "text-text-muted hover:text-text-secondary hover:bg-surface-hover/30"
                    }`}
                    aria-current={isItemActive ? "page" : undefined}
                  >
                    <span className="w-1 h-1 rounded-full bg-current shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {userRole && canViewAdminPanel(userRole) && (
          <>
            <div className="pt-4 pb-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted px-3">
                Administration
              </p>
            </div>
            <Link
              href="/admin/feedback"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                pathname.startsWith("/admin")
                  ? "text-accent bg-accent-light shadow-card"
                  : "text-text-muted hover:text-text-secondary hover:bg-surface-hover/50"
              }`}
            >
              <ShieldIcon />
              <span>Administration</span>
            </Link>
          </>
        )}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="bg-gradient-to-br from-accent/10 to-transparent p-4 rounded-xl border border-accent/20">
          <h4 className="text-sm font-semibold text-accent mb-1">Premium</h4>
          <p className="text-xs text-text-muted mb-3 leading-relaxed">
            Débloquez les analyses avancées et le coaching IA illimité.
          </p>
          <UpgradeButton
            label="Passer Premium"
            className="w-full text-xs font-semibold bg-accent hover:bg-accent-hover text-white py-2.5 rounded-lg transition-all duration-200 shadow-glow"
          />
        </div>
      </div>
    </aside>
  );
}
