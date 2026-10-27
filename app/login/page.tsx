import type { Metadata } from "next";
import {
  ArrowLeft,
  BarChart3,
  Bookmark,
  Check,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { GithubIcon } from "@/components/ui/brand-icons";
import { Logo } from "@/components/ui/logo";
import { auth, githubEnabled } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in with GitHub to save favorite developers and build a private DevPulse dashboard.",
};

const BENEFITS = [
  {
    icon: Bookmark,
    title: "Save the developers you follow",
    description:
      "Build a watchlist of profiles and jump back into their latest snapshot.",
  },
  {
    icon: BarChart3,
    title: "Your own dashboard",
    description:
      "A focused view of saved scores, languages, and activity — no feed, no noise.",
  },
  {
    icon: Sparkles,
    title: "Public by design",
    description:
      "Everything on the public dashboards stays accessible without an account.",
  },
] as const;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  let session = null;
  try {
    session = await auth();
  } catch {
    session = null;
  }

  const { callbackUrl } = await searchParams;
  const safeCallback =
    callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/dashboard";

  if (session?.user) redirect(safeCallback);

  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-7 sm:p-10">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-40 dark:opacity-20" />
        <div className="pointer-events-none absolute -left-16 -top-20 size-64 rounded-full bg-accent/15 blur-3xl" />
        <div className="relative">
          <Logo />
          <div className="mt-12 max-w-lg">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              A calmer GitHub dashboard
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold leading-[1.02] tracking-tight sm:text-5xl">
              Keep the profiles that matter,{" "}
              <span className="text-gradient">close at hand.</span>
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              DevPulse turns public GitHub activity into a clear, shareable
              developer story. Sign in only when you want to save developers or
              open your personal dashboard.
            </p>
          </div>

          <div className="mt-9 space-y-3">
            {BENEFITS.map((benefit) => (
              <div
                key={benefit.title}
                className="flex items-start gap-3 rounded-xl border border-border/80 bg-background/35 p-3.5"
              >
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent">
                  <benefit.icon className="size-4" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold">{benefit.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Check className="size-3 text-accent" aria-hidden />
              No password stored
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="size-3 text-accent" aria-hidden />
              No repo write access
            </span>
            <span className="inline-flex items-center gap-1.5">
              <GithubIcon className="size-3" aria-hidden />
              GitHub OAuth
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center">
        <div className="mb-5 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            Back to DevPulse
          </Link>
          <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Secure sign-in
          </span>
        </div>
        <LoginForm githubEnabled={githubEnabled} callbackUrl={safeCallback} />
        <p className="mt-5 text-center text-[11px] leading-relaxed text-muted-foreground">
          By continuing, you agree to GitHub&apos;s terms. DevPulse stores only
          your account id, display name, email, avatar URL, and saved usernames.
        </p>
      </div>
    </div>
  );
}
