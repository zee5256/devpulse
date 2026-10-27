import { BarChart3, Bookmark, Check, Sparkles } from "lucide-react";

import { GithubIcon } from "@/components/ui/brand-icons";
import { Logo } from "@/components/ui/logo";

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

const COPY = {
  login: {
    eyebrow: "A calmer GitHub dashboard",
    title: "Keep the profiles that matter,",
    accent: "close at hand.",
    description:
      "DevPulse turns public GitHub activity into a clear, shareable developer story. Sign in to save developers, compare scores, and open your personal dashboard.",
  },
  signup: {
    eyebrow: "Your developer watchlist",
    title: "Start your GitHub story,",
    accent: "with a place to keep it.",
    description:
      "Create a free DevPulse account to save the profiles you care about and keep their scores, languages, and activity in one calm dashboard.",
  },
} as const;

export function AuthAside({ mode }: { mode: "login" | "signup" }) {
  const copy = COPY[mode];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-7 sm:p-10">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40 dark:opacity-20" />
      <div className="pointer-events-none absolute -left-16 -top-20 size-64 rounded-full bg-accent/15 blur-3xl" />
      <div className="relative">
        <Logo />
        <div className="mt-12 max-w-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {copy.eyebrow}
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-[1.02] tracking-tight sm:text-5xl">
            {copy.title}{" "}
            <span className="text-gradient">{copy.accent}</span>
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {copy.description}
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
            Passwords hashed with scrypt
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Check className="size-3 text-accent" aria-hidden />
            No repo write access
          </span>
          <span className="inline-flex items-center gap-1.5">
            <GithubIcon className="size-3" aria-hidden />
            GitHub OAuth optional
          </span>
        </div>
      </div>
    </div>
  );
}
