"use client";

import { useState } from "react";
import type { SettingsData } from "@/services/settings/types";
import { ProfileSection } from "./ProfileSection";
import { NotificationsSection } from "./NotificationsSection";
import { AiSection } from "./AiSection";
import { PrivacySection } from "./PrivacySection";
import { OverlaySection } from "./OverlaySection";

const TABS = [
  { id: "profile", label: "Profil", icon: ProfileIcon },
  { id: "overlay", label: "Overlay", icon: OverlayIcon },
  { id: "notifications", label: "Notifications", icon: BellIcon },
  { id: "ai", label: "IA", icon: AiIcon },
  { id: "privacy", label: "Confidentialité", icon: LockIcon },
] as const;

function ProfileIcon() {
  return (
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function OverlayIcon() {
  return (
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

function AiIcon() {
  return (
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

interface SettingsPageProps {
  initialData: SettingsData;
}

export function SettingsPage({ initialData }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState<string>("profile");

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Paramètres</h1>
        <p className="text-slate-400 mt-2">Gérez vos préférences et la configuration de votre compte.</p>
      </div>

      <div className="flex gap-1 bg-[#111115] border border-slate-800 rounded-2xl p-1.5 overflow-x-auto" role="tablist" aria-label="Catégories de paramètres">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={activeTab === id}
            aria-controls={`panel-${id}`}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === id
                ? "bg-rose-500/10 text-rose-400 shadow-sm"
                : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
            }`}
          >
            <Icon />
            {label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id="panel-profile" aria-labelledby="Profil" hidden={activeTab !== "profile"}>
        {activeTab === "profile" && <ProfileSection initial={initialData.profile} />}
      </div>
      <div role="tabpanel" id="panel-overlay" aria-labelledby="Overlay" hidden={activeTab !== "overlay"}>
        {activeTab === "overlay" && <OverlaySection initialTheme={initialData.overlayTheme} initialWidgets={initialData.overlayWidgets} />}
      </div>
      <div role="tabpanel" id="panel-notifications" aria-labelledby="Notifications" hidden={activeTab !== "notifications"}>
        {activeTab === "notifications" && <NotificationsSection initial={initialData.notifications} />}
      </div>
      <div role="tabpanel" id="panel-ai" aria-labelledby="IA" hidden={activeTab !== "ai"}>
        {activeTab === "ai" && <AiSection initial={initialData.ai} />}
      </div>
      <div role="tabpanel" id="panel-privacy" aria-labelledby="Confidentialité" hidden={activeTab !== "privacy"}>
        {activeTab === "privacy" && <PrivacySection initial={initialData.privacy} />}
      </div>
    </div>
  );
}
