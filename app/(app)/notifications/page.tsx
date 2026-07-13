import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getNotifications } from "@/services/notifications/notifications-service";
import { NotificationsPageClient } from "./client";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Centre de notifications ValoStats : alertes, analyses, objectifs et mises à jour.",
};

function BellIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

export default async function NotificationsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const initialData = await getNotifications(user.id, { page: 1, pageSize: 20 });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <PageHeader
        icon={<BellIcon />}
        title="Notifications"
        description="Centre de notifications"
      />

      <NotificationsPageClient initialData={initialData} />
    </div>
  );
}
