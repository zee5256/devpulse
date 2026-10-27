import { ArrowUpRight, GitFork, Sparkles, Star, Users } from "lucide-react";
import Link from "next/link";

import { MiniHeatmap } from "@/components/profile/mini-heatmap";
import { ScoreRing } from "@/components/profile/score-ring";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { ProfileResult } from "@/lib/cache/profile";
import { formatCompact, formatNumber } from "@/lib/utils";

export function HeroPreview({ profile }: { profile: ProfileResult | null }) {
  if (!profile) {
    return (
      <div className="relative mx-auto w-full max-w-md">
        <div className="absolute -inset-8 rounded-[3rem] bg-accent/10 blur-3xl" />
        <div className="glass relative rounded-3xl border border-border p-6 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="size-11 animate-pulse rounded-full bg-muted" />
            <div className="space-y-2">
              <div className="h-3 w-28 animate-pulse rounded bg-muted" />
              <div className="h-2.5 w-20 animate-pulse rounded bg-muted" />
            </div>
          </div>
          <div className="mt-8 grid place-items-center">
            <ScoreRing score={0} grade="—" />
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Live profiles warm up on first visit.
          </p>
        </div>
      </div>
    );
  }

  const { data, score } = profile;
  const categories = score.categories;

  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="absolute -inset-10 rounded-[3rem] bg-accent/10 blur-3xl" />
      <div className="absolute -right-3 -top-4 z-10 hidden rotate-2 sm:block">
        <div className="glass flex items-center gap-2 rounded-full border border-accent/25 px-3 py-1.5 text-[10px] font-semibold text-accent shadow-lg">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex size-1.5 rounded-full bg-accent" />
          </span>
          LIVE SNAPSHOT
        </div>
      </div>

      <div className="glass relative overflow-hidden rounded-[1.75rem] border border-border p-5 shadow-2xl sm:p-6">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
        <div className="flex items-center justify-between gap-3">
          <Link
            href={`/u/${data.user.login}`}
            className="group flex min-w-0 items-center gap-3"
          >
            <Avatar
              src={data.user.avatarUrl}
              alt={data.user.name ?? data.user.login}
              name={data.user.name}
              login={data.user.login}
              className="size-11 ring-2 ring-accent/20 ring-offset-2 ring-offset-card"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold group-hover:text-accent">
                {data.user.name ?? data.user.login}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                @{data.user.login}
              </p>
            </div>
          </Link>
          <Badge variant="success" className="shrink-0">
            Grade {score.grade}
          </Badge>
        </div>

        <div className="mt-6 grid grid-cols-[auto_1fr] items-center gap-5">
          <ScoreRing score={score.total} grade={score.grade} size={132} />
          <div className="space-y-2.5">
            {categories.map((category) => (
              <div key={category.key}>
                <div className="mb-1 flex items-center justify-between text-[10px]">
                  <span className="font-medium text-muted-foreground">
                    {category.label}
                  </span>
                  <span className="font-mono text-foreground/80">
                    {category.score}/{category.max}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-accent transition-all duration-700"
                    style={{
                      width: `${Math.round((category.score / category.max) * 100)}%`,
                      opacity: 0.45 + (category.score / category.max) * 0.55,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2">
          {[
            {
              label: "Commits",
              value: formatNumber(data.stats.commits),
              icon: GitFork,
            },
            {
              label: "Stars",
              value: formatCompact(data.stats.stars),
              icon: Star,
            },
            {
              label: "Followers",
              value: formatCompact(data.stats.followers),
              icon: Users,
            },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-border/70 bg-background/35 p-2.5">
              <item.icon className="mb-1.5 size-3.5 text-accent" aria-hidden />
              <p className="font-display text-sm font-bold leading-none">
                {item.value}
              </p>
              <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                {item.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-xl border border-border/70 bg-background/35 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
              <Sparkles className="size-3 text-accent" aria-hidden />
              Consistency
            </span>
            <span className="font-mono text-[10px] text-foreground/80">
              {data.insights.consistency}% active days
            </span>
          </div>
          <MiniHeatmap days={data.contributions} weeks={16} />
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-4">
          <p className="text-[10px] text-muted-foreground">
            Updated {new Date(profile.fetchedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </p>
          <Link
            href={`/u/${data.user.login}`}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline"
          >
            Open dashboard
            <ArrowUpRight className="size-3.5" aria-hidden />
          </Link>
        </div>
      </div>

      <div className="absolute -bottom-4 -left-4 hidden rotate-[-3deg] items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-[10px] font-medium shadow-lg sm:flex">
        <span className="grid size-6 place-items-center rounded-lg bg-accent-soft text-accent">
          <Sparkles className="size-3" aria-hidden />
        </span>
        <span>
          Transparent score
          <span className="block text-[9px] font-normal text-muted-foreground">
            4 pillars · 100 points
          </span>
        </span>
      </div>
    </div>
  );
}
