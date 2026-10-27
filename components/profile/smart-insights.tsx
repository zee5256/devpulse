import { Activity, CalendarDays, Code2, Flame } from "lucide-react";

import type { ProfileData } from "@/lib/github/normalize";
import { cn } from "@/lib/utils";

export function SmartInsights({ data }: { data: ProfileData }) {
  const insights = [
    {
      label: "Most active day",
      value: data.insights.mostActiveWeekday,
      detail: `${data.insights.mostActiveWeekdayCount.toLocaleString()} contributions on this weekday`,
      icon: CalendarDays,
    },
    {
      label: "Favorite language",
      value: data.insights.favoriteLanguage,
      detail: `${data.insights.favoriteLanguagePercent}% of your language footprint`,
      icon: Code2,
    },
    {
      label: "Consistency",
      value: `${data.insights.consistency}%`,
      detail: `${data.stats.activeDays} active days across the last year`,
      icon: Activity,
    },
    {
      label: "Busiest month",
      value: data.insights.busiestMonth,
      detail: `${data.insights.busiestMonthCount.toLocaleString()} contributions`,
      icon: Flame,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {insights.map((insight, index) => (
        <div
          key={insight.label}
          className={cn(
            "rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]",
            index === 2 && "relative overflow-hidden",
          )}
        >
          {index === 2 ? (
            <div className="absolute inset-x-0 bottom-0 h-1 bg-muted">
              <div
                className="h-full bg-accent"
                style={{ width: `${data.insights.consistency}%` }}
              />
            </div>
          ) : null}
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <insight.icon className="size-3.5 text-accent" aria-hidden />
            {insight.label}
          </div>
          <p className="mt-3 truncate font-display text-lg font-bold tracking-tight">
            {insight.value}
          </p>
          <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-muted-foreground">
            {insight.detail}
          </p>
        </div>
      ))}
    </div>
  );
}
