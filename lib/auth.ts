import NextAuth, { type NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter } from "next-auth/adapters";

import { prisma } from "@/lib/prisma";

const githubEnabled = Boolean(
  process.env.AUTH_GITHUB_ID?.trim() &&
    process.env.AUTH_GITHUB_SECRET?.trim(),
);

const providers: NextAuthConfig["providers"] = githubEnabled
  ? [
      GitHub({
        clientId: process.env.AUTH_GITHUB_ID,
        clientSecret: process.env.AUTH_GITHUB_SECRET,
        allowDangerousEmailAccountLinking: true,
      }),
    ]
  : [];

export const authConfig = {
  adapter: PrismaAdapter(prisma) as Adapter,
  session: { strategy: "database", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  providers,
  callbacks: {
    async signIn({ user, profile }) {
      const githubLogin =
        profile && "login" in profile && typeof profile.login === "string"
          ? profile.login
          : null;

      if (githubLogin && user.id) {
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              githubUsername: githubLogin,
              image: user.image ?? undefined,
            },
          });
        } catch (error) {
          // A unique collision can happen when GitHub returns an email that
          // already exists under another session. Do not block sign-in for a
          // profile metadata update.
          console.error("Could not sync GitHub username.", error);
        }
      }
      return true;
    },
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.githubUsername =
          (user as { githubUsername?: string | null }).githubUsername ?? null;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

export { githubEnabled };
