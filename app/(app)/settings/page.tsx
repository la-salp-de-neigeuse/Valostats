import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getSettings } from "@/services/settings/settings-service";
import { SettingsPage } from "@/components/settings/SettingsPage";

export const metadata: Metadata = {
  title: "Paramètres",
  description: "Configuration de votre compte ValoStats : notifications, confidentialité, IA et overlay.",
};

export default async function SettingsPageRoute() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const settings = await getSettings(user.id);

  return <SettingsPage initialData={settings} user={user} />;
}
