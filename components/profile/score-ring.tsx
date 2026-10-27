import { cn } from "@/lib/utils";

export function ScoreRing({
  score,
  grade,
  size = 148,
  strokeWidth = 11,
  className,
  showGrade = true,
}: {
  score: number;
  grade: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showGrade?: boolean;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(100, Math.max(0, score)) / 100);

  return (
    <div
      className={cn("relative grid shrink-0 place-items-center", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Developer score ${score} out of 100, grade ${grade}`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
          style={{
            filter:
              "drop-shadow(0 0 6px color-mix(in oklab, var(--accent) 50%, transparent))",
          }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div
            className="font-display font-bold leading-none tracking-tight"
            style={{ fontSize: size * 0.26 }}
          >
            {score}
          </div>
          {showGrade ? (
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {grade} · /100
            </div>
          ) : (
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              /100
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
