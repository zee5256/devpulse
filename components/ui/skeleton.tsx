import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-muted",
        className,
      )}
      aria-hidden
      {...props}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <Skeleton className="mb-4 h-4 w-20" />
      <Skeleton className="mb-2 h-8 w-24" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}
