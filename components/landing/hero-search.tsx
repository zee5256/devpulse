"use client";

import { ArrowRight, Search, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DEMO_USERS } from "@/lib/constants";
import { usernameSchema } from "@/lib/validations";
import { cn } from "@/lib/utils";

export function HeroSearch({
  size = "hero",
  className,
}: {
  size?: "hero" | "compact";
  className?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  function go(raw: string) {
    const parsed = usernameSchema.safeParse(raw);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Enter a username.";
      setError(message);
      toast.error(message);
      return;
    }
    setError(null);
    router.push(`/u/${parsed.data}`);
  }

  return (
    <div className={cn("w-full", className)}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          go(value);
        }}
        className={cn(
          "group flex items-center gap-2 rounded-2xl border border-border bg-card p-1.5 shadow-[var(--shadow-soft)] transition-colors focus-within:border-accent/50 focus-within:ring-4 focus-within:ring-accent/10",
          size === "hero" ? "sm:p-2" : "rounded-xl",
        )}
        role="search"
      >
        <Search
          className="ml-2.5 size-5 shrink-0 text-muted-foreground"
          aria-hidden
        />
        <Input
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            if (error) setError(null);
          }}
          placeholder="Enter a GitHub username"
          aria-label="GitHub username"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "hero-search-error" : undefined}
          autoComplete="off"
          spellCheck={false}
          className={cn(
            "h-10 flex-1 border-0 bg-transparent px-0 shadow-none focus:ring-0",
            size === "hero" ? "text-base sm:h-11" : "text-sm",
          )}
        />
        <Button
          type="submit"
          size={size === "hero" ? "lg" : "md"}
          className={cn("shrink-0", size === "hero" && "rounded-xl")}
        >
          <Sparkles className="size-4" aria-hidden />
          Pulse it
          <ArrowRight className="size-4" aria-hidden />
        </Button>
      </form>
      {error ? (
        <p id="hero-search-error" className="mt-2 pl-3 text-xs text-danger" role="alert">
          {error}
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="mr-1">Try</span>
        {DEMO_USERS.slice(0, 3).map((username) => (
          <button
            key={username}
            type="button"
            onClick={() => {
              setValue(username);
              go(username);
            }}
            className="rounded-full border border-border bg-surface px-2.5 py-1 font-mono text-[11px] text-muted-foreground transition-colors hover:border-accent/40 hover:text-accent"
          >
            @{username}
          </button>
        ))}
      </div>
    </div>
  );
}
