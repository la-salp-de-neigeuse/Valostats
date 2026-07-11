import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getOverlaySettings } from "@/services/overlay/overlay-settings-service";
import { getOverlayData } from "@/services/overlay/overlay-service";
import { SettingsForm } from "@/components/overlay/SettingsForm";

export const metadata: Metadata = {
  title: "Overlay",
  description: "Personnalisez votre overlay stream Valorant : thèmes, widgets et configuration OBS.",
};
import { OverlayRenderer } from "@/components/overlay/OverlayRenderer";

export default async function OverlaySettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const settings = await getOverlaySettings(user.id);

  const previewData = await getOverlayData(user.publicSlug);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://valostats.app";
  const obsUrl = `${baseUrl}/overlay?user=${user.publicSlug}`;
  const tiktokUrl = obsUrl;

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200">
      <div className="max-w-6xl mx-auto p-6 md:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Overlay Settings</h1>
          <p className="text-slate-400 mt-1">
            Personnalisez votre overlay pour OBS Studio, TikTok LIVE Studio et autres logiciels de streaming
          </p>
        </div>

        <div className="grid xl:grid-cols-5 gap-8">
          <div className="xl:col-span-3 space-y-6">
            {/* OBS URL */}
            <div className="bg-[#111115] border border-slate-800 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                URL navigateur
              </h2>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 w-8 shrink-0">OBS</span>
                  <code className="flex-1 bg-[#0a0a0c] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 break-all">
                    {obsUrl}
                  </code>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 w-8 shrink-0">TTL</span>
                  <code className="flex-1 bg-[#0a0a0c] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 break-all">
                    {tiktokUrl}
                  </code>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-3">
                Ajoutez cette URL comme source navigateur (1920x1080 recommandé, fond transparent). L&apos;overlay se rafraîchit automatiquement à l&apos;intervalle configuré.
              </p>
            </div>

            {/* Settings form */}
            <div className="bg-[#111115] border border-slate-800 rounded-2xl p-6">
              <SettingsForm initialSettings={settings} />
            </div>
          </div>

          {/* Live Preview */}
          <div className="xl:col-span-2">
            <div className="bg-[#111115] border border-slate-800 rounded-2xl p-4 sticky top-8">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Aperçu en direct
              </h2>
              <div
                className="rounded-xl overflow-hidden border border-slate-700/50"
                style={{ aspectRatio: "16 / 9" }}
              >
                {previewData ? (
                  <div style={{ transform: "scale(0.5)", transformOrigin: "top left", width: "200%", height: "200%" }}>
                    <OverlayRenderer initialData={previewData} slug={user.publicSlug} />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-sm text-slate-500">
                    Aucune donnée disponible
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-3">
                Aperçu réduit à 50%. Les modifications sont visibles après sauvegarde.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
