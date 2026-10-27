"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { MonthlyPoint } from "@/lib/github/normalize";
import { formatNumber } from "@/lib/utils";

const RANGES = [3, 6, 12] as const;

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value?: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-xl">
      <p className="font-medium">{label}</p>
      <p className="mt-1 text-muted-foreground">
        <span className="font-semibold text-foreground">
          {formatNumber(payload[0]?.value ?? 0)}
        </span>{" "}
        contributions
      </p>
    </div>
  );
}

export function CommitChart({ monthly }: { monthly: MonthlyPoint[] }) {
  const [range, setRange] = useState<(typeof RANGES)[number]>(12);
  const data = monthly.slice(-range);
  const total = data.reduce((sum, point) => sum + point.contributions, 0);
  const peak = data.reduce(
    (best, point) => (point.contributions > best.contributions ? point : best),
    data[0] ?? { month: "", label: "—", contributions: 0 },
  );

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-baseline gap-2">
            <p className="font-display text-2xl font-bold tracking-tight">
              {formatNumber(total)}
            </p>
            <p className="text-xs text-muted-foreground">contributions</p>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Peak: {peak.label} · {formatNumber(peak.contributions)}
          </p>
        </div>
        <div
          className="inline-flex rounded-lg border border-border bg-muted/50 p-1"
          role="group"
          aria-label="Chart range"
        >
          {RANGES.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setRange(option)}
              aria-pressed={range === option}
              className={
                range === option
                  ? "rounded-md bg-card px-2.5 py-1 text-[11px] font-semibold text-foreground shadow-sm"
                  : "rounded-md px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground"
              }
            >
              {option}M
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 h-[240px] w-full" role="img" aria-label={`Contribution trend over the last ${range} months`}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="commit-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.32} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="var(--chart-grid)"
              strokeDasharray="3 4"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
              interval="preserveStartEnd"
              minTickGap={18}
              dy={6}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
              width={48}
              tickFormatter={(value: number) =>
                new Intl.NumberFormat("en-US", {
                  notation: "compact",
                  maximumFractionDigits: 1,
                }).format(value)
              }
            />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--border)" }} />
            <Area
              type="monotone"
              dataKey="contributions"
              stroke="var(--accent)"
              strokeWidth={2.25}
              fill="url(#commit-fill)"
              activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }}
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
