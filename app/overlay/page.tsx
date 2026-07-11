import type { Metadata } from "next";
import { getOverlayData } from "@/services/overlay/overlay-service";
import { OverlayRenderer } from "@/components/overlay/OverlayRenderer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Overlay Stream",
  description: "Overlay temps réel pour streamers Valorant avec statistiques, classement et analyses IA.",
  robots: { index: false, follow: false },
};

export default async function OverlayPage({
  searchParams,
}: {
  searchParams: Promise<{ user?: string }>;
}) {
  const { user } = await searchParams;

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#050505]">
        <p className="text-white/80 text-sm">Ajoutez ?user=VOTRE_SLUG dans l&apos;URL</p>
      </div>
    );
  }

  const data = await getOverlayData(user);

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#050505]">
        <p className="text-white/80 text-sm">Utilisateur introuvable</p>
      </div>
    );
  }

  return <OverlayRenderer initialData={data} slug={user} />;
}
