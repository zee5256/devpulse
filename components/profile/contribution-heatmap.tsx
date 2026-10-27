"use client";

import { useMemo, useRef, useState } from "react";

import type { ContributionDay } from "@/lib/github/normalize";
import { cn } from "@/lib/utils";

const CELL = 11;
const GAP = 3;
const STEP = CELL + GAP;
const LEFT = 30;
const TOP = 22;

function level(count: number, max: number): number {
  if (count <= 0) return 0;
  if (max <= 1) return 2;
  const ratio = count / max;
  if (ratio > 0.72) return 4;
  if (ratio > 0.42) return 3;
  if (ratio > 0.18) return 2;
  return 1;
}

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

const MONTH_FORMAT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  timeZone: "UTC",
});

export function ContributionHeatmap({
  days,
  username,
}: {
  days: ContributionDay[];
  username: string;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);

  const model = useMemo(() => {
    if (days.length === 0) {
      return { weeks: [] as ContributionDay[][], max: 1, width: LEFT + 53 * STEP };
    }
    const maxWeek = Math.max(...days.map((day) => day.weekIndex));
    const minWeek = Math.min(...days.map((day) => day.weekIndex));
    const byWeek = new Map<number, ContributionDay[]>();
    for (const day of days) {
      const bucket = byWeek.get(day.weekIndex) ?? [];
      bucket.push(day);
      byWeek.set(day.weekIndex, bucket);
    }
    const weeks = Array.from({ length: maxWeek - minWeek + 1 }, (_, index) => {
      const week = minWeek + index;
      const entries = byWeek.get(week) ?? [];
      return Array.from({ length: 7 }, (_, weekday) => {
        const existing = entries.find((day) => day.weekday === weekday);
        return (
          existing ?? {
            date: "",
            count: 0,
            weekday,
            weekIndex: week,
          }
        );
      });
    });

    return {
      weeks,
      max: Math.max(1, ...days.map((day) => day.count)),
      width: LEFT + weeks.length * STEP,
    };
  }, [days]);

  const flat = useMemo(() => model.weeks.flat(), [model.weeks]);
  const activeDay = activeIndex !== null ? flat[activeIndex] : null;
  const height = TOP + 7 * STEP + 24;

  const monthLabels = useMemo(() => {
    const labels: Array<{ label: string; week: number }> = [];
    let lastLabel = "";
    for (let week = 0; week < model.weeks.length; week += 1) {
      const first = model.weeks[week].find((day) => day.date);
      if (!first) continue;
      const label = MONTH_FORMAT.format(new Date(`${first.date}T00:00:00Z`));
      const month = first.date.slice(0, 7);
      if (month !== lastLabel) {
        if (
          labels.length === 0 ||
          week - labels[labels.length - 1].week >= 3
        ) {
          labels.push({ label, week });
        }
        lastLabel = month;
      }
    }
    return labels;
  }, [model.weeks]);

  function handleMove(
    event: React.MouseEvent<SVGRectElement>,
    day: ContributionDay,
    index: number,
  ) {
    if (!day.date) return;
    const wrapper = wrapperRef.current;
    const container = containerRef.current;
    if (!wrapper || !container) return;
    const rect = wrapper.getBoundingClientRect();
    const maxX = Math.max(64, rect.width - 64);
    setHover({
      x: Math.min(maxX, Math.max(64, event.clientX - rect.left)),
      y: event.clientY - rect.top,
    });
    setActiveIndex(index);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (flat.length === 0) return;
    const current = activeIndex ?? flat.length - 1;
    let next = current;
    if (event.key === "ArrowLeft") next = Math.max(0, current - 7);
    else if (event.key === "ArrowRight") next = Math.min(flat.length - 1, current + 7);
    else if (event.key === "ArrowUp") next = Math.max(0, current - 1);
    else if (event.key === "ArrowDown") next = Math.min(flat.length - 1, current + 1);
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = flat.length - 1;
    else return;

    event.preventDefault();
    setActiveIndex(next);
    const day = flat[next];
    if (day?.date) {
      const wrapper = wrapperRef.current;
      const container = containerRef.current;
      if (wrapper && container) {
        const cellX = LEFT + day.weekIndex * STEP;
        const cellY = TOP + day.weekday * STEP;
        container.scrollTo({
          left: Math.max(0, cellX - container.clientWidth / 2),
          behavior: "smooth",
        });

        const wrapperRect = wrapper.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const maxX = Math.max(64, wrapperRect.width - 64);
        setHover({
          x: Math.min(
            maxX,
            Math.max(
              64,
              containerRect.left - wrapperRect.left + cellX - container.scrollLeft,
            ),
          ),
          y: containerRect.top - wrapperRect.top + cellY,
        });
      }
    }
  }

  if (days.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        No contribution data available for this profile.
      </p>
    );
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div
        ref={containerRef}
        className="scrollbar-slim relative overflow-x-auto pb-1"
        tabIndex={0}
        role="grid"
        aria-label={`Contribution heatmap for ${username}. Use arrow keys to explore daily contributions.`}
        onKeyDown={handleKeyDown}
        onBlur={() => setHover(null)}
        onScroll={() => setHover(null)}
      >
        <svg
          width="100%"
          viewBox={`0 0 ${Math.max(model.width, 740)} ${height}`}
          className="min-w-[720px] select-none"
          aria-hidden
        >
          {monthLabels.map((month) => (
            <text
              key={`${month.week}-${month.label}`}
              x={LEFT + month.week * STEP}
              y={10}
              className="fill-muted-foreground"
              fontSize="9"
              fontWeight="600"
            >
              {month.label}
            </text>
          ))}

          {["Mon", "Wed", "Fri"].map((label, index) => (
            <text
              key={label}
              x={0}
              y={TOP + (index * 2 + 1) * STEP + 9}
              className="fill-muted-foreground"
              fontSize="9"
            >
              {label}
            </text>
          ))}

          {model.weeks.map((week, weekIndex) =>
            week.map((day, weekday) => {
              const index = weekIndex * 7 + weekday;
              const isActive = activeIndex === index && day.date;
              return (
                <rect
                  key={`${weekIndex}-${weekday}`}
                  x={LEFT + weekIndex * STEP}
                  y={TOP + weekday * STEP}
                  width={CELL}
                  height={CELL}
                  rx={2.5}
                  fill={
                    day.date
                      ? `var(--heat-${level(day.count, model.max)})`
                      : "transparent"
                  }
                  stroke={isActive ? "var(--foreground)" : "transparent"}
                  strokeWidth={isActive ? 1.5 : 0}
                  onMouseEnter={(event) => handleMove(event, day, index)}
                  onMouseLeave={() => {
                    setHover(null);
                    setActiveIndex(null);
                  }}
                  className={cn(
                    day.date && "cursor-crosshair transition-[stroke] duration-100",
                  )}
                />
              );
            }),
          )}
        </svg>
      </div>

      {hover && activeDay?.date ? (
        <div
          className="pointer-events-none absolute z-20 rounded-lg border border-border bg-card px-2.5 py-2 text-[11px] shadow-xl"
          style={{
            left: hover.x,
            top: hover.y,
            transform:
              hover.y > 72
                ? "translate(-50%, calc(-100% - 10px))"
                : "translate(-50%, 12px)",
          }}
          role="tooltip"
        >
          <p className="font-semibold">
            {activeDay.count} contribution{activeDay.count === 1 ? "" : "s"}
          </p>
          <p className="mt-0.5 whitespace-nowrap text-[10px] text-muted-foreground">
            {DATE_FORMAT.format(new Date(`${activeDay.date}T00:00:00Z`))}
          </p>
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[10px] text-muted-foreground">
          Hover a cell or focus the grid and use arrow keys.
        </p>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((levelIndex) => (
            <span
              key={levelIndex}
              className="size-2.5 rounded-[2px]"
              style={{ backgroundColor: `var(--heat-${levelIndex})` }}
              aria-hidden
            />
          ))}
          <span>More</span>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {activeDay?.date
          ? `${activeDay.count} contributions on ${DATE_FORMAT.format(
              new Date(`${activeDay.date}T00:00:00Z`),
            )}`
          : ""}
      </p>
    </div>
  );
}
