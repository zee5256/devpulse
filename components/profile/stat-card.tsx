import type { LucideIcon } from "lucide-react";

import { CountUp } from "@/components/ui/count-up";
import { cn } from "@/lib/utils";

export function StatCard({
  icon: Icon,
  label,
  value,
  detail,
  compact = false,
  suffix = "",
  className,
  index = 0,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  detail: string;
  compact?: boolean;
  suffix?: string;
  className?: string;
  index?: number;
}) {
  return (
    <div
      className={cn(
        "card-hover group relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-soft)] sm:p-5",
        className,
      )}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="flex items-center justify-between gap-3">
        <span className="grid size-8 place-items-center rounded-lg bg-accent-soft text-accent">
          <Icon className="size-4" aria-hidden />
        </span>
        <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          12 months
        </span>
      </div>
      <p className="mt-4 font-display text-2xl font-bold tracking-tight sm:text-[1.7rem]">
        <CountUp value={value} compact={compact} suffix={suffix} />
      </p>
      <p className="mt-1 text-xs font-medium text-foreground/80">{label}</p>
      <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{detail}</p>
    </div>
  );
}
