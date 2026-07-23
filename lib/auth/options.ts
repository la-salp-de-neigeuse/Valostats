import type { NextAuthOptions, User as NextAuthUser } from "next-auth";
import type { UserRole, UserPlan, ProfileVisibility } from "@prisma/client";
import CredentialsProvider from "next-auth/providers/credentials";
import { encode as encodeJwt, decode as decodeJwt } from "next-auth/jwt";

import { authenticateUser } from "@/services/users/user-service";
import { loginSchema } from "@/lib/validation/auth";

type ValoStatsAuthUser = NextAuthUser & {
  role: UserRole;
  plan: UserPlan;
  visibility: ProfileVisibility;
  publicSlug: string;
  privacyVersion: number;
  sessionVersion: number;
  rememberMe?: boolean;
};

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET is not set — authentication will fail");
}

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
        rememberMe: { label: "Rester connecté", type: "checkbox" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const parsedCredentials = loginSchema.safeParse({
          email: credentials.email,
          password: credentials.password,
        });

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
          rememberMe: credentials.rememberMe === "true",
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
        token.rememberMe = authUser.rememberMe;
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
  jwt: {
    async encode({ token, secret }) {
      if (!token) return "";

      const now = Math.floor(Date.now() / 1000);
      const rememberMe = (token as { rememberMe?: boolean }).rememberMe !== false;
      const maxAgeSecs = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60;

      return await encodeJwt({
        token: {
          ...token,
          iat: now,
          exp: now + maxAgeSecs,
        },
        secret,
      });
    },
    async decode({ token, secret }) {
      if (!token) return null;
      try {
        return await decodeJwt({ token, secret });
      } catch {
        return null;
      }
    },
  },
};
