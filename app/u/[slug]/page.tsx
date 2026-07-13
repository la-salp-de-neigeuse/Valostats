import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { getPublicProfile } from "@/services/public-profile/public-profile-service";
import { getSocialLinksForProfile } from "@/services/social/social-service";
import { PublicProfileView } from "@/components/public-profile/PublicProfileView";
import type { Metadata } from "next";

interface PublicProfilePageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ period?: string }>;
}

export async function generateMetadata({ params }: PublicProfilePageProps): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getPublicProfile(slug);

  if ("code" in profile) {
    return {
      title: "Profil introuvable - ValoStats",
      description: "Ce profil n'existe pas ou est privé.",
    };
  }

  const displayName = profile.user.name || profile.user.riotAccount?.gameName || "Joueur";
  const rank = profile.user.riotAccount?.currentRank || "Non classé";

  return {
    title: `${displayName} - ValoStats`,
    description: `Statistiques Valorant de ${displayName} — Rang: ${rank} — Winrate: ${profile.stats.winRate}% — K/D: ${profile.stats.kdRatio}`,
    openGraph: {
      title: `${displayName} - ValoStats`,
      description: `Statistiques Valorant de ${displayName} — Rang: ${rank} — Winrate: ${profile.stats.winRate}%`,
      type: "profile",
      locale: "fr_FR",
    },
    twitter: {
      card: "summary_large_image",
      title: `${displayName} - ValoStats`,
      description: `Statistiques Valorant de ${displayName} — Rang: ${rank} — Winrate: ${profile.stats.winRate}%`,
    },
  };
}

export default async function PublicProfilePage({ params, searchParams }: PublicProfilePageProps) {
  const { slug } = await params;
  const { period = "all" } = await searchParams;

  const profile = await getPublicProfile(slug, period as "7d" | "30d" | "all");

  if ("code" in profile) {
    if (profile.code === "NOT_FOUND") {
      notFound();
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">{profile.message}</h1>
          <p className="text-slate-400">Ce profil n&apos;est pas accessible publiquement.</p>
        </div>
      </div>
    );
  }

  const session = await getServerSession(authOptions);
  const socialLinks = await getSocialLinksForProfile(profile.user.id, session?.user?.id);

  return <PublicProfileView profile={profile} socialLinks={socialLinks} />;
}
