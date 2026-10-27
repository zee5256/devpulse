import Link from "next/link";

import { cn } from "@/lib/utils";

export function PulseMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-xl bg-accent text-accent-foreground shadow-lg shadow-accent/20",
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-5">
        <path
          d="M2.5 12h3.2l1.8-5.1 3 10.2 2.1-7.2 1.7 2.1h7.2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_55%)]" />
    </span>
  );
}

export function Logo({
  showWordmark = true,
  className,
}: {
  showWordmark?: boolean;
  className?: string;
}) {
  return (
    <Link
      href="/"
      aria-label="DevPulse home"
      className={cn(
        "group inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <PulseMark className="transition-transform duration-300 group-hover:scale-105" />
      {showWordmark ? (
        <span className="font-display text-[1.05rem] font-bold tracking-tight">
          Dev<span className="text-accent">Pulse</span>
        </span>
      ) : null}
    </Link>
  );
}
