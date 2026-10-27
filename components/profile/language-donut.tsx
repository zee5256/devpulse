"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import type { LanguageSlice } from "@/lib/github/normalize";

function DonutTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; payload?: LanguageSlice }>;
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload;
  if (!item) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-xl">
      <p className="font-semibold">{item.name}</p>
      <p className="mt-0.5 text-muted-foreground">{item.percent}% of language size</p>
    </div>
  );
}

export function LanguageDonut({ languages }: { languages: LanguageSlice[] }) {
  if (languages.length === 0) {
    return (
      <div className="grid h-[280px] place-items-center text-sm text-muted-foreground">
        No language data available.
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-[1fr_1.05fr] sm:items-center">
      <div className="relative mx-auto h-[220px] w-full max-w-[240px]" role="img" aria-label="Language breakdown donut chart">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={languages}
              dataKey="size"
              nameKey="name"
              innerRadius="66%"
              outerRadius="94%"
              paddingAngle={2}
              stroke="var(--card)"
              strokeWidth={2}
              animationDuration={800}
            >
              {languages.map((language) => (
                <Cell key={language.name} fill={language.color} />
              ))}
            </Pie>
            <Tooltip content={<DonutTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="font-display text-2xl font-bold">{languages[0].percent}%</p>
            <p className="mt-0.5 max-w-[90px] truncate text-[10px] text-muted-foreground">
              {languages[0].name}
            </p>
          </div>
        </div>
      </div>

      <ul className="space-y-2.5">
        {languages.slice(0, 6).map((language) => (
          <li key={language.name} className="flex items-center gap-2.5 text-xs">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: language.color }}
              aria-hidden
            />
            <span className="min-w-0 flex-1 truncate text-foreground/85">
              {language.name}
            </span>
            <span className="font-mono text-[11px] text-muted-foreground">
              {language.percent}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
