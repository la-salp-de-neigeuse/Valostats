import type { UserRole, UserPlan, ProfileVisibility } from "@prisma/client";
import { DefaultSession } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      plan: UserPlan;
      visibility: ProfileVisibility;
      publicSlug: string;
      privacyVersion: number;
      sessionVersion: number;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role: UserRole;
    plan: UserPlan;
    visibility: ProfileVisibility;
    publicSlug: string;
    privacyVersion: number;
    sessionVersion: number;
    rememberMe?: boolean;
  }
}
