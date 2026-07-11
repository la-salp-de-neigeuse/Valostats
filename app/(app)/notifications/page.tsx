import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getNotifications } from "@/services/notifications/notifications-service";
import { NotificationsPageClient } from "./client";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Centre de notifications ValoStats : alertes, analyses, objectifs et mises à jour.",
};

function BellIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      <div className="flex items-center gap-3">
        <div className="p-2 bg-rose-500/10 rounded-xl text-rose-400">
          <BellIcon />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Notifications</h1>
          <p className="text-slate-400 mt-1">Centre de notifications</p>
        </div>
      </div>

      <NotificationsPageClient initialData={initialData} />
    </div>
  );
}
