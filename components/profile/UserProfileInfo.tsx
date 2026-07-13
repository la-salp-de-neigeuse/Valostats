import type { UserProfile } from "@/services/users/user-service";
import { UpgradeButton } from "@/components/subscription/UpgradeButton";
import { RoleBadge } from "@/components/roles/RoleBadge";
import { hasAnyAdminPermission } from "@/services/roles/types";

export function UserProfileInfo({ user }: { user: UserProfile }) {
  return (
    <div className="bg-surface border border-slate-800 rounded-3xl p-8 flex flex-col h-full">
      <h2 className="text-xl font-bold text-white mb-6">Informations du compte</h2>
      
      <div className="space-y-6 flex-1">
        <div>
          <label className="text-sm font-medium text-slate-500">Pseudonyme ValoStats</label>
          <p className="text-lg text-slate-200 mt-1">{user.name || "Utilisateur"}</p>
        </div>
        
        <div>
          <label className="text-sm font-medium text-slate-500">Email</label>
          <p className="text-lg text-slate-200 mt-1">{user.email}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-500">Rôle</label>
          <div className="mt-2">
            <RoleBadge role={user.role} size="md" />
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium text-slate-500">Plan actuel</label>
          <div className="mt-2 flex items-center gap-3">
            <span className="px-3 py-1 bg-accent-light text-accent text-sm font-semibold rounded-lg border border-accent/20">
              {user.plan}
            </span>
            {user.plan === "FREE" && !hasAnyAdminPermission(user.role) && (
              <UpgradeButton label="Mettre à niveau" className="text-sm text-slate-400 hover:text-white transition-colors" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
