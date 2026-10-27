import { ArrowUpRight, GitFork, Star } from "lucide-react";
import Link from "next/link";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { ProfileResult } from "@/lib/cache/profile";
import { formatCompact } from "@/lib/utils";

export function DemoCard({ profile }: { profile: ProfileResult }) {
  const { data, score } = profile;
  return (
    <Link
      href={`/u/${data.user.login}`}
      className="card-hover group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar
            src={data.user.avatarUrl}
            alt={data.user.name ?? data.user.login}
            name={data.user.name}
            login={data.user.login}
            className="size-10"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold group-hover:text-accent">
              {data.user.name ?? data.user.login}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              @{data.user.login}
            </p>
          </div>
        </div>
        <Badge variant={score.total >= 80 ? "success" : "default"} className="shrink-0">
          {score.total} · {score.grade}
        </Badge>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {data.languages.slice(0, 3).map((language) => (
          <span
            key={language.name}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground"
          >
            <span
              className="size-1.5 rounded-full"
              style={{ backgroundColor: language.color }}
            />
            {language.name}
          </span>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 border-t border-border/70 pt-4 text-xs">
        <div>
          <p className="font-display text-sm font-bold">
            {formatCompact(data.stats.stars)}
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
            <Star className="size-2.5" aria-hidden /> Stars
          </p>
        </div>
        <div>
          <p className="font-display text-sm font-bold">
            {formatCompact(data.stats.commits)}
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
            <GitFork className="size-2.5" aria-hidden /> Commits
          </p>
        </div>
        <div>
          <p className="font-display text-sm font-bold">
            {data.insights.consistency}%
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">Consistency</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-[11px] font-medium text-accent">
        <span>Explore the dashboard</span>
        <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
      </div>
    </Link>
  );
}
