import { Info, TrendingUp } from "lucide-react";

import { ScoreRing } from "@/components/profile/score-ring";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tooltip } from "@/components/ui/tooltip";
import type { DeveloperScore } from "@/lib/score/calculate";
import { cn } from "@/lib/utils";

export function ScoreBreakdown({
  score,
  className,
}: {
  score: DeveloperScore;
  className?: string;
}) {
  return (
    <Card id="score" className={cn("relative scroll-mt-24 overflow-hidden p-5 sm:p-6", className)}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Developer Score
          </p>
          <h2 className="mt-1 font-display text-lg font-semibold">How you rank</h2>
        </div>
        <Badge variant={score.total >= 70 ? "success" : score.total >= 50 ? "default" : "warning"}>
          <TrendingUp className="size-3" aria-hidden />
          {score.label}
        </Badge>
      </div>

      <div className="mt-5 flex items-center gap-5">
        <ScoreRing score={score.total} grade={score.grade} size={132} />
        <div className="min-w-0">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {score.summary}
          </p>
          <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground">
            Scored on the last 12 months of public GitHub activity.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3.5">
        {score.categories.map((category) => (
          <div key={category.key}>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium">{category.label}</span>
                <Tooltip content={category.explanation}>
                  <button
                    type="button"
                    aria-label={`About the ${category.label} score`}
                    className="grid size-4 place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Info className="size-3" aria-hidden />
                  </button>
                </Tooltip>
              </div>
              <span className="font-mono text-[11px] text-muted-foreground">
                {category.score}/{category.max}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-accent transition-all duration-700"
                style={{
                  width: `${Math.round((category.score / category.max) * 100)}%`,
                  opacity: 0.45 + (category.score / category.max) * 0.55,
                }}
              />
            </div>
            <p className="mt-1 truncate text-[10px] text-muted-foreground">
              {category.detail}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-5 border-t border-border/70 pt-4 text-[10px] leading-relaxed text-muted-foreground">
        Activity 30 · Consistency 25 · Impact 30 · Diversity 15. Log scaling keeps
        the score fair across project sizes.
      </p>
    </Card>
  );
}
