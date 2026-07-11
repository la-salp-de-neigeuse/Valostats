import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { canManageRoles } from "@/services/roles/types";
import { getAllUsersWithRoles } from "@/services/roles/role-service";
import { RoleManagementTable } from "./RoleManagementTable";

export const metadata = {
  title: "Gestion des rôles",
};

export default async function AdminRolesPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || !canManageRoles(currentUser.role)) {
    redirect("/dashboard");
  }

  const users = await getAllUsersWithRoles();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Gestion des rôles</h1>
        <p className="text-slate-400 mt-2">Gérez les permissions des utilisateurs de la plateforme.</p>
      </div>
      <RoleManagementTable users={users} currentUserRole={currentUser.role} />
    </div>
  );
}
