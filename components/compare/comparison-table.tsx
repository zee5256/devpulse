import { Check } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { ProfileResult } from "@/lib/cache/profile";
import { formatCompact, formatNumber } from "@/lib/utils";

type Row = {
  label: string;
  a: number;
  b: number;
  format?: "number" | "compact";
  suffix?: string;
};

function format(value: number, format: Row["format"], suffix = "") {
  return `${format === "compact" ? formatCompact(value) : formatNumber(value)}${suffix}`;
}

export function CompareStatTable({
  a,
  b,
}: {
  a: ProfileResult;
  b: ProfileResult;
}) {
  const rows: Row[] = [
    { label: "Developer Score", a: a.score.total, b: b.score.total, suffix: "/100" },
    { label: "Commits", a: a.data.stats.commits, b: b.data.stats.commits },
    {
      label: "Contributions",
      a: a.data.stats.totalContributions,
      b: b.data.stats.totalContributions,
      format: "compact",
    },
    { label: "Stars", a: a.data.stats.stars, b: b.data.stats.stars, format: "compact" },
    {
      label: "Pull requests",
      a: a.data.stats.pullRequests,
      b: b.data.stats.pullRequests,
    },
    { label: "Issues", a: a.data.stats.issues, b: b.data.stats.issues },
    {
      label: "Public repos",
      a: a.data.stats.publicRepos,
      b: b.data.stats.publicRepos,
    },
    {
      label: "Followers",
      a: a.data.stats.followers,
      b: b.data.stats.followers,
      format: "compact",
    },
    {
      label: "Longest streak",
      a: a.data.stats.longestStreak,
      b: b.data.stats.longestStreak,
      suffix: " days",
    },
    {
      label: "Consistency",
      a: a.data.insights.consistency,
      b: b.data.insights.consistency,
      suffix: "%",
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="w-1/3 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Metric
            </th>
            {[a, b].map((profile) => (
              <th key={profile.data.user.login} className="w-1/3 px-3 py-3">
                <div className="flex flex-col items-center gap-1.5">
                  <Avatar
                    src={profile.data.user.avatarUrl}
                    alt={profile.data.user.name ?? profile.data.user.login}
                    name={profile.data.user.name}
                    login={profile.data.user.login}
                    className="size-7"
                  />
                  <span className="text-xs font-medium">
                    @{profile.data.user.login}
                  </span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const aWins = row.a > row.b;
            const bWins = row.b > row.a;
            return (
              <tr key={row.label} className="border-b border-border/60 last:border-0">
                <td className="py-3 text-xs text-muted-foreground">{row.label}</td>
                {[
                  { value: row.a, wins: aWins, profile: a },
                  { value: row.b, wins: bWins, profile: b },
                ].map((entry) => (
                  <td key={entry.profile.data.user.login} className="px-3 py-3 text-center">
                    <span
                      className={
                        entry.wins
                          ? "inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 font-mono text-xs font-semibold text-accent"
                          : "inline-flex items-center gap-1.5 px-2.5 py-1 font-mono text-xs text-foreground/75"
                      }
                    >
                      {entry.wins ? <Check className="size-3" aria-label="Higher" /> : null}
                      {format(entry.value, row.format, row.suffix)}
                    </span>
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function CompareCategoryGrid({
  a,
  b,
}: {
  a: ProfileResult;
  b: ProfileResult;
}) {
  return (
    <div className="space-y-4">
      {a.score.categories.map((category, index) => {
        const other = b.score.categories[index];
        const aPct = Math.round((category.score / category.max) * 100);
        const bPct = Math.round((other.score / other.max) * 100);
        return (
          <div key={category.key}>
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-medium">{category.label}</span>
              <span className="font-mono text-[10px] text-muted-foreground">
                {category.score}/{category.max} vs {other.score}/{other.max}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="h-2 overflow-hidden rounded-full bg-muted" title={`@${a.data.user.login}: ${category.score}/${category.max}`}>
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${aPct}%` }}
                />
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted" title={`@${b.data.user.login}: ${other.score}/${other.max}`}>
                <div
                  className="h-full rounded-full bg-[#94a3b8]"
                  style={{ width: `${bPct}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
      <div className="flex items-center justify-between border-t border-border/70 pt-3 text-[10px] text-muted-foreground">
        <Badge variant="default">A · @{a.data.user.login}</Badge>
        <Badge variant="muted">B · @{b.data.user.login}</Badge>
      </div>
    </div>
  );
}
