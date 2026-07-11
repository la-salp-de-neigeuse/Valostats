import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { canViewFeedback } from "@/services/roles/types";
import { FeedbackAdminClient } from "./FeedbackAdminClient";

export const metadata = {
  title: "Gestion des feedbacks",
};

export default async function AdminFeedbackPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || !canViewFeedback(currentUser.role)) {
    redirect("/dashboard");
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Gestion des feedbacks</h1>
        <p className="text-slate-400 mt-2">Consultez et gérez les retours des utilisateurs.</p>
      </div>
      <FeedbackAdminClient currentUserRole={currentUser.role} />
    </div>
  );
}
