import { ArrowLeft, Search } from "lucide-react";
import Link from "next/link";

import { HeroSearch } from "@/components/landing/hero-search";
import { Button } from "@/components/ui/button";
import { DEMO_USERS } from "@/lib/constants";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <span className="mb-6 grid size-14 place-items-center rounded-2xl bg-accent-soft text-accent">
        <Search className="size-7" aria-hidden />
      </span>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
        404 · Developer not found
      </p>
      <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
        That profile is off the grid.
      </h1>
      <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
        The username may be misspelled, deleted, or never existed. Try another
        GitHub handle — no sign-in needed.
      </p>
      <div className="mt-8 w-full max-w-lg">
        <HeroSearch size="compact" />
      </div>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
        <Button variant="secondary" asChild>
          <Link href="/">
            <ArrowLeft className="size-4" aria-hidden />
            Back home
          </Link>
        </Button>
        {DEMO_USERS.slice(0, 3).map((username) => (
          <Button key={username} variant="ghost" size="sm" asChild>
            <Link href={`/u/${username}`}>@{username}</Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
