"use client";

import { useState, type ReactNode } from "react";
import type { SettingsData } from "@/services/settings/types";
import type { UserProfile } from "@/services/users/user-service";
import { PageHeader } from "@/components/ui/page-header";
import { SettingsSidebar } from "./SettingsSidebar";
import { AccountSection } from "./sections/AccountSection";
import { ProfileSection } from "./sections/ProfileSection";
import { AppearanceSection } from "./sections/AppearanceSection";
import { RiotSection } from "./sections/RiotSection";
import { NotificationsSection } from "./sections/NotificationsSection";
import { PrivacySection } from "./sections/PrivacySection";
import { SecuritySection } from "./sections/SecuritySection";
import { SessionsSection } from "./sections/SessionsSection";
import { DataSection } from "./sections/DataSection";
import { DangerSection } from "./sections/DangerSection";
import { SocialSection } from "./SocialSection";

interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
}

interface SettingsPageProps {
  initialData: SettingsData;
  user: UserProfile;
}

function SettingsIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function SocialIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function PaletteIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r="0.5" /><circle cx="17.5" cy="10.5" r="0.5" /><circle cx="8.5" cy="7.5" r="0.5" /><circle cx="6.5" cy="12.5" r="0.5" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01a1.5 1.5 0 0 1-.11-2.11c.53-.6 1.46-.75 2.19-.38.58.3 1.31.22 1.81-.22.6-.53.88-1.33.72-2.12-.2-.94.42-1.92 1.38-2.12.86-.18 1.74.14 2.32.75.52.55 1.39.47 1.81-.13.42-.6.58-1.33.43-2.05C21.29 4.69 17.07 2 12 2z" />
    </svg>
  );
}

function GamepadIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" x2="10" y1="11" y2="11" /><line x1="8" y1="9" x2="8" y2="13" /><line x1="15" x2="15.01" y1="12" y2="12" /><line x1="18" x2="18.01" y1="10" y2="10" />
      <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3 1 1 0 0 0 1-1 1 1 0 0 1 1-1h.28a1 1 0 0 1 .98.717c.18.614.61 1.196 1.24 1.283a2.18 2.18 0 0 0 .56 0c.63-.087 1.06-.669 1.24-1.283a1 1 0 0 1 .98-.717H12a1 1 0 0 1 1 1 1 1 0 0 0 1 1 3 3 0 0 0 3-3c0-1.544-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

const NAV_ITEMS: NavItem[] = [
  { id: "account", label: "Compte", icon: <SettingsIcon /> },
  { id: "profile", label: "Profil", icon: <ProfileIcon /> },
  { id: "social", label: "Réseaux sociaux", icon: <SocialIcon /> },
  { id: "appearance", label: "Apparence", icon: <PaletteIcon /> },
  { id: "riot", label: "Riot", icon: <GamepadIcon /> },
  { id: "notifications", label: "Notifications", icon: <BellIcon /> },
  { id: "privacy", label: "Confidentialité", icon: <LockIcon /> },
  { id: "security", label: "Sécurité", icon: <ShieldIcon /> },
  { id: "sessions", label: "Sessions actives", icon: <GlobeIcon /> },
  { id: "data", label: "Téléchargement des données", icon: <DownloadIcon /> },
  { id: "danger", label: "Suppression du compte", icon: <AlertIcon /> },
];

export function SettingsPage({ initialData, user }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState("account");

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <PageHeader
        title="Paramètres"
        description="Gérez vos préférences et la configuration de votre compte."
      />

      <div className="flex flex-col md:flex-row gap-8">
        <SettingsSidebar items={NAV_ITEMS} active={activeTab} onChange={setActiveTab} />

        <div className="flex-1 min-w-0 space-y-6">
          {activeTab === "account" && (
            <AccountSection
              email={user.email}
              plan={user.plan}
              role={user.role}
              createdAt={user.createdAt}
              hasRiotAccount={!!initialData.profile.riotGameName}
            />
          )}
          {activeTab === "profile" && <ProfileSection initial={initialData.profile} />}
          {activeTab === "social" && <SocialSection />}
          {activeTab === "appearance" && <AppearanceSection />}
          {activeTab === "riot" && <RiotSection gameName={initialData.profile.riotGameName} tagLine={initialData.profile.riotTagLine} />}
          {activeTab === "notifications" && <NotificationsSection initial={initialData.notifications} />}
          {activeTab === "privacy" && <PrivacySection initial={initialData.privacy} />}
          {activeTab === "security" && <SecuritySection />}
          {activeTab === "sessions" && <SessionsSection />}
          {activeTab === "data" && <DataSection />}
          {activeTab === "danger" && <DangerSection />}
        </div>
      </div>
    </div>
  );
}
