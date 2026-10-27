import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter } from "next-auth/adapters";

import { verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { credentialsSchema } from "@/lib/validations";

const githubEnabled = Boolean(
  process.env.AUTH_GITHUB_ID?.trim() &&
    process.env.AUTH_GITHUB_SECRET?.trim(),
);

function normalizeGithubLogin(profile: unknown): string | null {
  if (!profile || typeof profile !== "object") return null;
  const login = (profile as { login?: unknown }).login;
  return typeof login === "string" && login.length > 0
    ? login.toLowerCase()
    : null;
}

const providers: NextAuthConfig["providers"] = [
  ...(githubEnabled
    ? [
        GitHub({
          clientId: process.env.AUTH_GITHUB_ID,
          clientSecret: process.env.AUTH_GITHUB_SECRET,
          allowDangerousEmailAccountLinking: true,
        }),
      ]
    : []),
  Credentials({
    name: "Email and password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(rawCredentials) {
      const parsed = credentialsSchema.safeParse(rawCredentials);
      if (!parsed.success) return null;

      // Keep credential stuffing and brute-force attempts bounded even when
      // the caller never reaches the signup API.
      try {
        const ip = await getClientIp();
        const limit = await checkRateLimit(ip, "auth");
        if (!limit.success) return null;
      } catch {
        // Never block sign-in because the optional limiter is unavailable.
      }

      const user = await prisma.user.findFirst({
        where: {
          email: { equals: parsed.data.email, mode: "insensitive" },
        },
      });
      if (!user?.passwordHash) return null;

      const valid = await verifyPassword(
        parsed.data.password,
        user.passwordHash,
      );
      if (!valid) return null;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        githubUsername: user.githubUsername,
      };
    },
  }),
];

export const authConfig = {
  adapter: PrismaAdapter(prisma) as Adapter,
  // Credentials sign-in requires JWT sessions. The Prisma adapter is still
  // used for GitHub OAuth account linking and user records.
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  providers,
  callbacks: {
    async signIn({ user, profile }) {
      const githubLogin = normalizeGithubLogin(profile);

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
          // A unique collision can happen when a GitHub email already exists
          // under another account. Do not block sign-in for a metadata update.
          console.error("Could not sync GitHub username.", error);
        }
      }
      return true;
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.sub = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
        token.githubUsername =
          (user as { githubUsername?: string | null }).githubUsername ?? null;
      }

      if (account?.provider === "github") {
        const githubLogin = normalizeGithubLogin(profile);
        if (githubLogin) token.githubUsername = githubLogin;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.githubUsername =
          typeof token.githubUsername === "string"
            ? token.githubUsername
            : null;
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
