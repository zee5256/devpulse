import { AlertTriangle, ArrowLeft, SearchX } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon = SearchX,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ElementType;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center",
        className,
      )}
    >
      <span className="mb-5 grid size-12 place-items-center rounded-2xl bg-accent-soft text-accent">
        <Icon className="size-6" aria-hidden />
      </span>
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title,
  message,
  retryHref,
  children,
}: {
  title: string;
  message: string;
  retryHref?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center rounded-3xl border border-danger/20 bg-danger/5 px-6 py-16 text-center">
      <span className="mb-5 grid size-12 place-items-center rounded-2xl bg-danger/10 text-danger">
        <AlertTriangle className="size-6" aria-hidden />
      </span>
      <h1 className="font-display text-2xl font-bold">{title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{message}</p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        {retryHref ? (
          <Button asChild>
            <Link href={retryHref}>Try again</Link>
          </Button>
        ) : null}
        <Button variant="secondary" asChild>
          <Link href="/">
            <ArrowLeft className="size-4" aria-hidden />
            Back home
          </Link>
        </Button>
      </div>
      {children}
    </div>
  );
}
