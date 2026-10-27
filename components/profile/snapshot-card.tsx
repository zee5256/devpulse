import { Clock3, Database, GitCommitHorizontal, ShieldCheck } from "lucide-react";

import { Card } from "@/components/ui/card";
import type { ProfileResult } from "@/lib/cache/profile";
import { formatDate, formatNumber, relativeTime } from "@/lib/utils";

export function SnapshotCard({ profile }: { profile: ProfileResult }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-lg bg-accent-soft text-accent">
          <Database className="size-4" aria-hidden />
        </span>
        <div>
          <h2 className="font-display text-sm font-semibold">Profile snapshot</h2>
          <p className="text-[10px] text-muted-foreground">
            Server-normalized, not scraped
          </p>
        </div>
      </div>
      <dl className="mt-4 space-y-2.5 text-xs">
        <div className="flex items-center justify-between gap-3">
          <dt className="flex items-center gap-1.5 text-muted-foreground">
            <Clock3 className="size-3" aria-hidden />
            Fetched
          </dt>
          <dd className="text-right font-medium">
            {relativeTime(profile.fetchedAt)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="flex items-center gap-1.5 text-muted-foreground">
            <GitCommitHorizontal className="size-3" aria-hidden />
            Contribution range
          </dt>
          <dd className="text-right font-medium">
            {formatDate(profile.data.meta.from)} – {formatDate(profile.data.meta.to)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="flex items-center gap-1.5 text-muted-foreground">
            <ShieldCheck className="size-3" aria-hidden />
            Repository sample
          </dt>
          <dd className="text-right font-medium">
            {formatNumber(profile.data.meta.repositorySampleSize)} owned repos
          </dd>
        </div>
      </dl>
      <p className="mt-4 rounded-lg bg-muted/50 p-2.5 text-[10px] leading-relaxed text-muted-foreground">
        Cached for 3 hours with stale-while-revalidate. Private contributions are
        counted by GitHub but not shown as individual days.
        {profile.data.stats.restrictedContributions > 0
          ? ` This profile has ${formatNumber(profile.data.stats.restrictedContributions)} restricted contributions.`
          : ""}
      </p>
    </Card>
  );
}
