"use client";

import { ArrowLeftRight, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usernameSchema } from "@/lib/validations";
import { cn } from "@/lib/utils";

export function CompareForm({
  initialA = "",
  initialB = "",
  compact = false,
  className,
}: {
  initialA?: string;
  initialB?: string;
  compact?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [a, setA] = useState(initialA);
  const [b, setB] = useState(initialB);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const parsedA = usernameSchema.safeParse(a);
    const parsedB = usernameSchema.safeParse(b);

    if (!parsedA.success) {
      setError("Enter a valid first GitHub username.");
      return;
    }
    if (!parsedB.success) {
      setError("Enter a valid second GitHub username.");
      return;
    }
    if (parsedA.data === parsedB.data) {
      setError("Pick two different developers to compare.");
      return;
    }

    setError(null);
    setLoading(true);
    router.push(`/compare/${parsedA.data}/${parsedB.data}`);
  }

  return (
    <form
      onSubmit={submit}
      className={cn(
        "rounded-2xl border border-border bg-card p-2 shadow-[var(--shadow-soft)]",
        compact ? "sm:p-2.5" : "sm:p-3",
        className,
      )}
    >
      <div className="grid items-center gap-2 sm:grid-cols-[1fr_auto_1fr_auto]">
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 grid size-5 -translate-y-1/2 place-items-center rounded-md bg-accent-soft font-mono text-[10px] font-bold text-accent">
            A
          </span>
          <Input
            value={a}
            onChange={(event) => {
              setA(event.target.value);
              setError(null);
            }}
            placeholder="First username"
            aria-label="First GitHub username"
            autoComplete="off"
            spellCheck={false}
            className={cn("pl-10", compact ? "h-10" : "h-11")}
          />
        </div>
        <span className="hidden text-muted-foreground sm:block">
          <ArrowLeftRight className="size-4" aria-hidden />
        </span>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 grid size-5 -translate-y-1/2 place-items-center rounded-md bg-muted font-mono text-[10px] font-bold text-muted-foreground">
            B
          </span>
          <Input
            value={b}
            onChange={(event) => {
              setB(event.target.value);
              setError(null);
            }}
            placeholder="Second username"
            aria-label="Second GitHub username"
            autoComplete="off"
            spellCheck={false}
            className={cn("pl-10", compact ? "h-10" : "h-11")}
          />
        </div>
        <Button type="submit" size={compact ? "md" : "lg"} disabled={loading}>
          {loading ? (
            <LoaderCircle className="animate-spin" aria-hidden />
          ) : (
            <ArrowLeftRight aria-hidden />
          )}
          Compare
        </Button>
      </div>
      {error ? (
        <p className="px-3 pb-2 pt-3 text-xs text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
