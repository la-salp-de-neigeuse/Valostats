"use client";

import { useState } from "react";
import type { UserProfile } from "@/services/users/user-service";
import type { SafeRiotAccount } from "@/services/riot-account/riot-account-service";
import type { ExtendedProfileData, ExtendedPrivacyData } from "@/services/profile/profile-service";
import type { SocialLinkData } from "@/services/social/social-service";
import { useToast } from "@/components/ui/toast";
import { SocialLinksDisplay } from "@/components/social/SocialLinksDisplay";
import { ProfileBanner } from "./ProfileBanner";
import { ProfileAvatar } from "./ProfileAvatar";
import { ProfileBio } from "./ProfileBio";
import { ProfilePrivacyOptions } from "./ProfilePrivacyOptions";
import { UserProfileInfo } from "./UserProfileInfo";
import { RiotConnectionCard } from "./RiotConnectionCard";

interface ProfilePageProps {
  user: UserProfile;
  riotAccount: SafeRiotAccount | null;
  extended: ExtendedProfileData;
  privacy: ExtendedPrivacyData;
  socialLinks: SocialLinkData[];
}

export function ProfilePage({ user, riotAccount, extended: initial, privacy: initialPrivacy, socialLinks }: ProfilePageProps) {
  const { addToast } = useToast();
  const [extended, setExtended] = useState(initial);
  const [privacy] = useState(initialPrivacy);

  function handleToast(variant: "success" | "error", title: string, description?: string) {
    addToast({ variant, title, description });
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <ProfileBanner
        bannerUrl={extended.bannerUrl}
        onBannerChange={(url) => setExtended((prev) => ({ ...prev, bannerUrl: url }))}
        onToast={handleToast}
      />

      <div className="px-4 sm:px-6">
        <ProfileAvatar
          image={extended.image}
          name={user.name}
          onAvatarChange={(url) => setExtended((prev) => ({ ...prev, image: url }))}
          onToast={handleToast}
        />

        <div className="mt-4 mb-6">
          <h1 className="text-2xl font-bold text-text-primary">
            {user.name || "Utilisateur"}
          </h1>
          {riotAccount && (
            <p className="text-text-secondary text-sm mt-0.5">
              {riotAccount.gameName}
              <span className="text-text-muted">#{riotAccount.tagLine}</span>
            </p>
          )}
        </div>

        <ProfileBio
          bio={extended.bio}
          onBioChange={(bio) => setExtended((prev) => ({ ...prev, bio }))}
          onToast={handleToast}
        />

        {socialLinks.length > 0 && (
          <div className="mt-4">
            <SocialLinksDisplay links={socialLinks} showVisibility />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <UserProfileInfo user={user} />
          <RiotConnectionCard account={riotAccount} />
        </div>

        <div className="mt-6">
          <ProfilePrivacyOptions
            user={user}
            showGoals={privacy.showGoals}
            showRecentMatches={privacy.showRecentMatches}
            onToast={handleToast}
          />
        </div>
      </div>
    </div>
  );
}
