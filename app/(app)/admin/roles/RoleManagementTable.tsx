"use client";

import type { UserRole } from "@prisma/client";
import { RoleBadge } from "@/components/roles/RoleBadge";
import { ROLE_HIERARCHY, ROLE_LABELS } from "@/services/roles/types";

interface UserRow {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  plan: string;
  publicSlug: string;
  createdAt: Date;
}

interface RoleManagementTableProps {
  users: UserRow[];
  currentUserRole: UserRole;
}

const ASSIGNABLE_ROLES: UserRole[] = ["ADMINISTRATOR", "MODERATOR", "PREMIUM", "FRIEND", "USER"];

export function RoleManagementTable({ users, currentUserRole }: RoleManagementTableProps) {
  const canAssignOwnerDev = currentUserRole === "OWNER";

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch("/api/admin/roles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Erreur lors de la mise à jour du rôle");
        return;
      }

      window.location.reload();
    } catch {
      alert("Erreur réseau");
    }
  };

  const sortedUsers = [...users].sort(
    (a, b) => (ROLE_HIERARCHY[b.role] ?? 0) - (ROLE_HIERARCHY[a.role] ?? 0)
  );

  return (
    <div className="bg-[#111115] border border-slate-800 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Utilisateur</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Rôle actuel</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Plan</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Nouveau rôle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {sortedUsers.map((user) => {
              const canEdit = canAssignOwnerDev || !["OWNER", "DEVELOPER"].includes(user.role);

              return (
                <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-orange-400 flex items-center justify-center text-white font-bold text-xs">
                        {(user.name || "U").charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-white">{user.name || "Utilisateur"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">{user.email}</td>
                  <td className="px-6 py-4">
                    <RoleBadge role={user.role} size="md" />
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-400">{user.plan}</span>
                  </td>
                  <td className="px-6 py-4">
                    {canEdit ? (
                      <select
                        defaultValue={user.role}
                        onChange={(e) => {
                          const newRole = e.target.value;
                          if (newRole !== user.role) {
                            if (confirm(`Confirmer le passage de ${user.name || "cet utilisateur"} au rôle "${ROLE_LABELS[newRole as UserRole]}" ?`)) {
                              handleRoleChange(user.id, newRole);
                            } else {
                              e.target.value = user.role;
                            }
                          }
                        }}
                        className="bg-slate-800 text-sm text-slate-200 border border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                      >
                        {(canAssignOwnerDev
                          ? ["OWNER" as UserRole, "DEVELOPER" as UserRole, ...ASSIGNABLE_ROLES]
                          : ASSIGNABLE_ROLES
                        ).map((role) => (
                          <option key={role} value={role}>
                            {ROLE_LABELS[role]}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-sm text-slate-500 italic">Non modifiable</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
