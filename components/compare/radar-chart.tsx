"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import type { ProfileResult } from "@/lib/cache/profile";

const A_COLOR = "var(--accent)";
const B_COLOR = "#94a3b8";

function RadarTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-xl">
      <p className="font-semibold">{label}</p>
      <div className="mt-1.5 space-y-1">
        {payload.map((item) => (
          <p key={item.name} className="flex items-center gap-2 text-[11px]">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: item.color }}
              aria-hidden
            />
            <span className="text-muted-foreground">{item.name}</span>
            <span className="ml-auto font-mono font-semibold">{item.value}%</span>
          </p>
        ))}
      </div>
    </div>
  );
}

export function CompareRadar({
  a,
  b,
}: {
  a: ProfileResult;
  b: ProfileResult;
}) {
  const data = a.score.categories.map((category, index) => {
    const other = b.score.categories[index];
    return {
      axis: category.label,
      a: Math.round((category.score / category.max) * 100),
      b: Math.round((other.score / other.max) * 100),
    };
  });

  return (
    <div>
      <div className="h-[310px] w-full" role="img" aria-label="Radar chart comparing score categories">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="72%">
            <PolarGrid stroke="var(--chart-grid)" />
            <PolarAngleAxis
              dataKey="axis"
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            />
            <PolarRadiusAxis
              domain={[0, 100]}
              tick={false}
              axisLine={false}
              tickCount={4}
            />
            <Tooltip content={<RadarTooltip />} />
            <Radar
              name={`@${a.data.user.login}`}
              dataKey="a"
              stroke={A_COLOR}
              fill={A_COLOR}
              fillOpacity={0.22}
              strokeWidth={2}
              animationDuration={800}
            />
            <Radar
              name={`@${b.data.user.login}`}
              dataKey="b"
              stroke={B_COLOR}
              fill={B_COLOR}
              fillOpacity={0.12}
              strokeWidth={2}
              animationDuration={800}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-5 text-xs">
        <span className="inline-flex items-center gap-2">
          <span className="size-2.5 rounded-full" style={{ backgroundColor: A_COLOR }} />
          @{a.data.user.login}
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="size-2.5 rounded-full" style={{ backgroundColor: B_COLOR }} />
          @{b.data.user.login}
        </span>
      </div>
    </div>
  );
}
