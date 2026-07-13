import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/session";
import { getRiotAccountByUserId } from "@/services/riot-account/riot-account-service";
import { getExtendedProfileData, getExtendedPrivacyData } from "@/services/profile/profile-service";
import { getUserSocialLinks } from "@/services/social/social-service";
import { redirect } from "next/navigation";
import { ProfilePage } from "@/components/profile/ProfilePage";

export const metadata: Metadata = {
  title: "Profil",
  description: "Gérez votre profil ValoStats et votre compte Riot Games.",
};

export default async function ProfilePageWrapper() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const [riotAccount, extended, privacy, socialLinks] = await Promise.all([
    getRiotAccountByUserId(user.id),
    getExtendedProfileData(user.id),
    getExtendedPrivacyData(user.id),
    getUserSocialLinks(user.id),
  ]);

  return (
    <ProfilePage
      user={user}
      riotAccount={riotAccount}
      extended={extended}
      privacy={privacy}
      socialLinks={socialLinks}
    />
  );
}
