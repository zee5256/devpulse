import type { ContributionDay } from "@/lib/github/normalize";
import { cn } from "@/lib/utils";

function level(count: number, max: number): number {
  if (count <= 0) return 0;
  if (max <= 1) return 2;
  const ratio = count / max;
  if (ratio > 0.75) return 4;
  if (ratio > 0.45) return 3;
  if (ratio > 0.2) return 2;
  return 1;
}

export function MiniHeatmap({
  days,
  weeks = 14,
  className,
}: {
  days: ContributionDay[];
  weeks?: number;
  className?: string;
}) {
  if (days.length === 0) return null;
  const lastWeek = Math.max(...days.map((day) => day.weekIndex));
  const firstWeek = Math.max(0, lastWeek - weeks + 1);
  const visible = days.filter((day) => day.weekIndex >= firstWeek);
  const max = Math.max(1, ...visible.map((day) => day.count));
  const columns = Array.from(
    { length: lastWeek - firstWeek + 1 },
    (_, index) => firstWeek + index,
  );

  return (
    <div
      className={cn("flex gap-[3px]", className)}
      role="img"
      aria-label={`Contribution activity for the last ${weeks} weeks`}
    >
      {columns.map((week) => {
        const weekDays = visible.filter((day) => day.weekIndex === week);
        return (
          <div key={week} className="grid gap-[3px]">
            {Array.from({ length: 7 }, (_, weekday) => {
              const day = weekDays.find((entry) => entry.weekday === weekday);
              return (
                <span
                  key={weekday}
                  className="size-[6px] rounded-[1.5px]"
                  style={{
                    backgroundColor: day
                      ? `var(--heat-${level(day.count, max)})`
                      : "transparent",
                  }}
                  title={day ? `${day.count} contributions on ${day.date}` : undefined}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
