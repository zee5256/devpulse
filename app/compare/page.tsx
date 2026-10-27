import type { Metadata } from "next";
import { ArrowLeftRight, Swords } from "lucide-react";

import { CompareForm } from "@/components/compare/compare-form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Compare developers",
  description:
    "Compare two GitHub developers side by side: activity, consistency, impact, language diversity, and Developer Score.",
  alternates: { canonical: "/compare" },
};

const EXAMPLES = [
  ["torvalds", "gaearon"],
  ["sindresorhus", "cassidoo"],
  ["gaearon", "sindresorhus"],
] as const;

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string }>;
}) {
  const { a } = await searchParams;

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <Badge className="mb-5 gap-2">
          <Swords className="size-3.5" aria-hidden />
          Head to head
        </Badge>
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Compare two developers.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Same data, same formula, side by side. See where each profile pulls
          ahead across Activity, Consistency, Impact, and Diversity.
        </p>
      </div>

      <div className="mx-auto mt-9 max-w-3xl">
        <CompareForm initialA={a ?? ""} />
      </div>

      <div className="mx-auto mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
        <span>Try a matchup:</span>
        {EXAMPLES.map(([left, right]) => (
          <a
            key={`${left}-${right}`}
            href={`/compare/${left}/${right}`}
            className="rounded-full border border-border bg-surface px-2.5 py-1 font-mono text-[11px] text-muted-foreground transition-colors hover:border-accent/40 hover:text-accent"
          >
            @{left} vs @{right}
          </a>
        ))}
      </div>

      <div className="mt-14 grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Four transparent axes",
            description:
              "Each radar spoke is a category percentage, so a 30-point Activity pillar and a 15-point Diversity pillar are directly comparable.",
          },
          {
            title: "Winner, without the noise",
            description:
              "The stat table highlights the higher number per metric, while the score cards keep context in view.",
          },
          {
            title: "Fresh from the cache",
            description:
              "Both profiles use the same 3-hour server cache, so the comparison is consistent and fast.",
          },
        ].map((item) => (
          <Card key={item.title} className="p-5">
            <div className="mb-3 grid size-9 place-items-center rounded-xl bg-accent-soft text-accent">
              <ArrowLeftRight className="size-4" aria-hidden />
            </div>
            <h2 className="font-display text-sm font-semibold">{item.title}</h2>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              {item.description}
            </p>
          </Card>
        ))}
      </div>

      <p className="mt-12 text-center text-[10px] text-muted-foreground">
        Comparing public GitHub data · {siteConfig.name}
      </p>
    </div>
  );
}
