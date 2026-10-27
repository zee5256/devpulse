import {
  ArrowRight,
  BarChart3,
  CalendarCheck2,
  Code2,
  GitPullRequest,
  Layers3,
  LineChart,
  LockKeyhole,
  Search,
  Share2,
  Sparkles,
  Star,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";

import { DemoCard } from "@/components/landing/demo-card";
import { HeroPreview } from "@/components/landing/hero-preview";
import { HeroSearch } from "@/components/landing/hero-search";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MotionFade } from "@/components/ui/count-up";
import { ScoreRing } from "@/components/profile/score-ring";
import { getProfile, type ProfileResult } from "@/lib/cache/profile";
import { DEMO_USERS } from "@/lib/constants";

export const dynamic = "force-dynamic";

const FEATURES = [
  {
    icon: CalendarCheck2,
    title: "Contribution heatmap",
    description:
      "A crisp, GitHub-style year in review with keyboard-friendly tooltips and streak highlights.",
  },
  {
    icon: BarChart3,
    title: "Transparent score",
    description:
      "One 0–100 number across Activity, Consistency, Impact, and Diversity — with the formula in plain sight.",
  },
  {
    icon: Layers3,
    title: "Language DNA",
    description:
      "See the languages you actually ship, aggregated by repository language size, not guesswork.",
  },
  {
    icon: LineChart,
    title: "12-month trends",
    description:
      "Switch between 3, 6, and 12 month views to spot momentum, quiet spells, and your busiest month.",
  },
  {
    icon: Users,
    title: "Compare developers",
    description:
      "Put two profiles side by side with a radar chart, shared stat table, and category-by-category score.",
  },
  {
    icon: Share2,
    title: "Share-ready cards",
    description:
      "Download a profile card or share a link with rich Open Graph previews generated on demand.",
  },
] as const;

const SCORE_PILLARS = [
  {
    key: "activity",
    label: "Activity",
    max: 30,
    description: "Commits, pull requests, issues, and reviews over the last year.",
  },
  {
    key: "consistency",
    label: "Consistency",
    max: 25,
    description: "Active days plus a bonus for your longest contribution streak.",
  },
  {
    key: "impact",
    label: "Impact",
    max: 30,
    description: "Stars and followers, log-scaled so every scale gets a fair shot.",
  },
  {
    key: "diversity",
    label: "Diversity",
    max: 15,
    description: "Language breadth and the size of your public repository portfolio.",
  },
] as const;

async function loadDemoProfiles(): Promise<ProfileResult[]> {
  const results = await Promise.allSettled(
    DEMO_USERS.slice(0, 3).map((username) =>
      getProfile(username, { ip: "landing" }),
    ),
  );

  return results.flatMap((result) => {
    if (result.status === "fulfilled") return [result.value];
    console.error(
      "Landing demo profile failed:",
      result.reason instanceof Error ? result.reason.message : result.reason,
    );
    return [];
  });
}

export default async function LandingPage() {
  const profiles = await loadDemoProfiles();
  const featured = profiles[0] ?? null;

  return (
    <>
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-50 dark:opacity-25" />
        <div className="pointer-events-none absolute -left-32 top-0 size-[36rem] rounded-full bg-accent/10 blur-[100px]" />
        <div className="pointer-events-none absolute -right-40 top-20 size-[34rem] rounded-full bg-accent/10 blur-[110px]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:gap-10 lg:px-8 lg:pb-28 lg:pt-20">
          <div>
            <Badge className="mb-6 gap-2 border-accent/25 bg-accent-soft px-3 py-1">
              <Sparkles className="size-3.5" aria-hidden />
              Free · Open source · No sign-in to explore
            </Badge>
            <h1 className="max-w-2xl text-balance font-display text-5xl font-bold leading-[0.98] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              Your GitHub footprint,{" "}
              <span className="text-gradient">in focus.</span>
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              Turn a year of commits into a clear developer story. Explore
              contribution patterns, language DNA, top repositories, and a
              transparent score — in seconds.
            </p>

            <div className="mt-8 max-w-xl">
              <HeroSearch />
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <span className="grid size-6 place-items-center rounded-lg bg-accent-soft text-accent">
                  <Zap className="size-3" aria-hidden />
                </span>
                3-hour smart cache
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="grid size-6 place-items-center rounded-lg bg-accent-soft text-accent">
                  <LockKeyhole className="size-3" aria-hidden />
                </span>
                Token stays server-side
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="grid size-6 place-items-center rounded-lg bg-accent-soft text-accent">
                  <Code2 className="size-3" aria-hidden />
                </span>
                Built on GitHub GraphQL
              </span>
            </div>
          </div>

          <div className="relative animate-[float_8s_ease-in-out_infinite] motion-reduce:animate-none lg:pl-4">
            <HeroPreview profile={featured} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Live examples
            </p>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Real profiles. Real data.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              These cards are generated from the GitHub GraphQL API, normalized
              on the server, and cached for three hours.
            </p>
          </div>
          <Button variant="secondary" asChild>
            <Link href="/compare">
              Compare any two
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        </div>

        {profiles.length > 0 ? (
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {profiles.map((profile, index) => (
              <MotionFade key={profile.data.user.login} delay={index * 0.06}>
                <DemoCard profile={profile} />
              </MotionFade>
            ))}
          </div>
        ) : (
          <Card className="mt-10 flex flex-col items-center justify-center gap-4 border-dashed px-6 py-16 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-accent-soft text-accent">
              <Search className="size-6" aria-hidden />
            </span>
            <div>
              <h3 className="font-display text-lg font-semibold">
                Profiles are warming up
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                The live demo data could not load right now. You can still search
                any GitHub username above.
              </p>
            </div>
          </Card>
        )}
      </section>

      <section
        id="features"
        className="relative scroll-mt-24 border-y border-border/60 bg-surface/35 py-20 lg:py-24"
      >
        <div className="pointer-events-none absolute inset-0 bg-dots opacity-[0.35] dark:opacity-20" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Everything in one view
            </p>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              A dashboard that respects your attention.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              No noisy widgets. Just the signals that explain how you build,
              where your impact lands, and what changed this year.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, index) => (
              <MotionFade key={feature.title} delay={index * 0.04}>
                <Card className="card-hover h-full p-6">
                  <span className="mb-5 grid size-11 place-items-center rounded-xl border border-accent/15 bg-accent-soft text-accent">
                    <feature.icon className="size-5" aria-hidden />
                  </span>
                  <h3 className="font-display text-base font-semibold">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </Card>
              </MotionFade>
            ))}
          </div>
        </div>
      </section>

      <section
        id="score"
        className="mx-auto max-w-7xl scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8 lg:py-24"
      >
        <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Developer Score
            </p>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              One number. No black box.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              DevPulse scores four pillars out of 100. Every point has a stated
              source, every axis is explained, and the formula is visible on the
              dashboard. Log scaling keeps the score fair for contributors at
              every scale.
            </p>
            <div className="mt-7 space-y-3">
              {SCORE_PILLARS.map((pillar) => (
                <div
                  key={pillar.key}
                  className="flex items-start gap-3 rounded-xl border border-border bg-card p-3.5"
                >
                  <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-accent-soft font-mono text-[11px] font-bold text-accent">
                    {pillar.max}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{pillar.label}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Button className="mt-7" asChild>
              <Link href="/u/torvalds#score">
                See a live breakdown
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[2.5rem] bg-accent/10 blur-3xl" />
            <Card className="glass relative overflow-hidden p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Sample breakdown
                  </p>
                  <p className="mt-1 font-display text-lg font-semibold">
                    A balanced open-source profile
                  </p>
                </div>
                <Badge variant="success">Grade A</Badge>
              </div>
              <div className="mt-8 grid items-center gap-8 sm:grid-cols-[auto_1fr]">
                <ScoreRing score={84} grade="A" size={158} />
                <div className="space-y-4">
                  {[
                    ["Activity", 25, 30],
                    ["Consistency", 21, 25],
                    ["Impact", 24, 30],
                    ["Diversity", 14, 15],
                  ].map(([label, value, max]) => (
                    <div key={String(label)}>
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-mono text-foreground/80">
                          {value}/{max}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-accent"
                          style={{
                            width: `${(Number(value) / Number(max)) * 100}%`,
                            opacity: 0.55 + (Number(value) / Number(max)) * 0.45,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-2 border-t border-border/70 pt-6 text-center">
                <div>
                  <p className="font-display text-lg font-bold">4</p>
                  <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    Pillars
                  </p>
                </div>
                <div>
                  <p className="font-display text-lg font-bold">100</p>
                  <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    Points
                  </p>
                </div>
                <div>
                  <p className="font-display text-lg font-bold">0</p>
                  <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    Guesswork
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-accent/20 bg-accent-soft/50 px-6 py-12 sm:px-10 lg:px-16 lg:py-16">
          <div className="pointer-events-none absolute inset-0 bg-dots opacity-50" />
          <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-accent/15 blur-3xl" />
          <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_auto]">
            <div>
              <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                <GitPullRequest className="size-4" aria-hidden />
                Your next profile review
              </div>
              <h2 className="max-w-2xl font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Put your GitHub work in perspective.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Search any public developer, compare two profiles, and save the
                ones worth following. Free, fast, and built to be understood.
              </p>
              <div className="mt-7 max-w-xl">
                <HeroSearch size="compact" />
              </div>
            </div>
            <div className="hidden flex-col items-center gap-3 lg:flex">
              <div className="grid size-20 place-items-center rounded-3xl border border-accent/20 bg-card text-accent shadow-xl">
                <Star className="size-9" aria-hidden />
              </div>
              <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
                No sign-in required
                <br />
                to explore
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
