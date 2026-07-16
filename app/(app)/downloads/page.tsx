import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { DownloadsPageClient } from "@/components/downloads/DownloadsPageClient";

export const metadata: Metadata = {
  title: "Téléchargements",
  description: "Téléchargez les applications officielles de ValoStats.",
};

export default async function DownloadsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return <DownloadsPageClient />;
}
