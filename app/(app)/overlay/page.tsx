import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getOverlaySettings } from "@/services/overlay/overlay-settings-service";
import { getOverlayData } from "@/services/overlay/overlay-service";
import { getUserPresets } from "@/services/overlay/overlay-preset-service";
import { OverlayManagementClient } from "@/components/overlay/OverlayManagementClient";
import { OverlayRenderer } from "@/components/overlay/OverlayRenderer";

export const metadata: Metadata = {
  title: "Overlay",
  description: "Créez et personnalisez vos overlays pour vos streams Valorant.",
};

export default async function OverlayPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?expired=1");
  }

  const [settings, presets] = await Promise.all([
    getOverlaySettings(user.id),
    getUserPresets(),
  ]);

  const previewData = await getOverlayData(user.publicSlug);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://valostats.app";
  const obsUrl = `${baseUrl}/overlay/view?user=${user.publicSlug}`;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Overlay</h1>
        <p className="text-text-muted mt-1">
          Créez et personnalisez vos overlays pour vos streams.
        </p>
      </div>

      <div className="grid xl:grid-cols-5 gap-8">
        <div className="xl:col-span-3 space-y-6">
          <OverlayManagementClient
            initialSettings={settings}
            initialPresets={presets}
            userSlug={user.publicSlug}
            obsUrl={obsUrl}
            plan={user.plan}
          />
        </div>

        <div className="xl:col-span-2">
          <div className="bg-surface border border-border rounded-2xl p-4 sticky top-24">
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
              Aperçu en direct
            </h2>
            <div
              className="rounded-xl overflow-hidden border border-border/50"
              style={{ aspectRatio: "16 / 9" }}
            >
              {previewData ? (
                <div style={{ transform: "scale(0.5)", transformOrigin: "top left", width: "200%", height: "200%" }}>
                  <OverlayRenderer initialData={previewData} slug={user.publicSlug} />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-text-muted">
                  Aucune donnée disponible
                </div>
              )}
            </div>
            <p className="text-xs text-text-muted mt-3">
              Aperçu réduit à 50%. Les modifications sont visibles après sauvegarde.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
