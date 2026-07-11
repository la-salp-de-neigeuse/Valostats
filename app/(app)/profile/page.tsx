import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/session";
import { getRiotAccountByUserId } from "@/services/riot-account/riot-account-service";
import { UserProfileInfo } from "@/components/profile/UserProfileInfo";
import { RiotConnectionCard } from "@/components/profile/RiotConnectionCard";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Profil",
  description: "Gérez votre profil ValoStats et votre compte Riot Games.",
};

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const riotAccount = await getRiotAccountByUserId(user.id);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Mon Profil</h1>
        <p className="text-slate-400 mt-2">Gérez vos informations personnelles et vos connexions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        <UserProfileInfo user={user} />
        <RiotConnectionCard account={riotAccount} />
      </div>
    </div>
  );
}
