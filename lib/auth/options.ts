import type { NextAuthOptions, User as NextAuthUser } from "next-auth";
import type { UserRole, UserPlan, ProfileVisibility } from "@prisma/client";
import CredentialsProvider from "next-auth/providers/credentials";

import { authenticateUser } from "@/services/users/user-service";
import { loginSchema } from "@/lib/validation/auth";

type ValoStatsAuthUser = NextAuthUser & {
  role: UserRole;
  plan: UserPlan;
  visibility: ProfileVisibility;
  publicSlug: string;
  privacyVersion: number;
  sessionVersion: number;
};

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Email et mot de passe",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        const parsedCredentials = loginSchema.safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const user = await authenticateUser(parsedCredentials.data);

        if (!user) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          plan: user.plan,
          visibility: user.visibility,
          publicSlug: user.publicSlug,
          privacyVersion: user.privacyVersion,
          sessionVersion: user.sessionVersion,
        } satisfies ValoStatsAuthUser;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const authUser = user as ValoStatsAuthUser;
        token.role = authUser.role;
        token.plan = authUser.plan;
        token.visibility = authUser.visibility;
        token.publicSlug = authUser.publicSlug;
        token.privacyVersion = authUser.privacyVersion;
        token.sessionVersion = authUser.sessionVersion;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role;
        session.user.plan = token.plan;
        session.user.visibility = token.visibility;
        session.user.publicSlug = token.publicSlug;
        session.user.privacyVersion = token.privacyVersion;
        session.user.sessionVersion = token.sessionVersion;
      }

      return session;
    },
  },
};
