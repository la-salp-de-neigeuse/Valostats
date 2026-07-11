import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/options";
import { getUserProfile, type UserProfile } from "@/services/users/user-service";

export async function getCurrentUser(): Promise<UserProfile | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  const profile = await getUserProfile(session.user.id);

  if (!profile || profile.sessionVersion !== session.user.sessionVersion) {
    return null;
  }

  return profile;
}
