import type { Metadata } from "next";
import { ArrowUpRight, Bookmark, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { FavoriteButton } from "@/components/profile/favorite-button";
import { HeroSearch } from "@/components/landing/hero-search";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/state-panel";
import { auth } from "@/lib/auth";
import { getProfileForPage, type ProfileResult } from "@/lib/cache/profile";
import { prisma } from "@/lib/prisma";
import { formatCompact } from "@/lib/utils";

export const metadata: Metadata = {
  title: "My dashboard",
  description: "Your saved developers, scores, and open-source watchlist.",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 18,
    select: { username: true },
  });

  const results = await Promise.allSettled(
    favorites.map((favorite) => getProfileForPage(favorite.username)),
  );

  const profiles = results.flatMap((result) =>
    result.status === "fulfilled" ? [result.value] : [],
  );
  profiles.sort((a, b) => b.score.total - a.score.total);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            My dashboard
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Your developer watchlist.
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Saved profiles, ranked by Developer Score. Public data, refreshed on
            the same 3-hour cache as the rest of DevPulse.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="muted">
            <Bookmark className="size-3" aria-hidden />
            {favorites.length} saved
          </Badge>
          <Button variant="secondary" asChild>
            <Link href="/compare">
              Compare
              <ArrowUpRight className="size-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </div>

      {profiles.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={Search}
            title={
              favorites.length > 0
                ? "Your saved profiles are warming up"
                : "Your watchlist is empty"
            }
            description={
              favorites.length > 0
                ? "We could not load your saved profiles right now. GitHub may be rate-limiting requests — try again in a few minutes."
                : "Open any developer dashboard and press Save. Your watchlist will appear here, sorted by score."
            }
            action={
              <div className="w-full max-w-sm">
                <HeroSearch size="compact" />
              </div>
            }
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {profiles.map((profile) => (
            <DashboardCard key={profile.data.user.login} profile={profile} />
          ))}
        </div>
      )}

      <div className="mt-10 rounded-2xl border border-accent/20 bg-accent-soft/40 p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-card text-accent shadow-sm">
              <Sparkles className="size-5" aria-hidden />
            </span>
            <div>
              <p className="font-display text-sm font-semibold">
                Find your next follow
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Search any public GitHub developer and compare their score shape.
              </p>
            </div>
          </div>
          <div className="w-full sm:max-w-sm">
            <HeroSearch size="compact" />
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardCard({ profile }: { profile: ProfileResult }) {
  const { data, score } = profile;
  return (
    <Card className="card-hover flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar
            src={data.user.avatarUrl}
            alt={data.user.name ?? data.user.login}
            name={data.user.name}
            login={data.user.login}
            className="size-10"
          />
          <div className="min-w-0">
            <Link
              href={`/u/${data.user.login}`}
              className="block truncate text-sm font-semibold hover:text-accent"
            >
              {data.user.name ?? data.user.login}
            </Link>
            <p className="truncate font-mono text-[11px] text-muted-foreground">
              @{data.user.login}
            </p>
          </div>
        </div>
        <Badge variant={score.total >= 70 ? "success" : "default"}>
          {score.total} · {score.grade}
        </Badge>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {data.languages.slice(0, 2).map((language) => (
          <span
            key={language.name}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground"
          >
            <span
              className="size-1.5 rounded-full"
              style={{ backgroundColor: language.color }}
            />
            {language.name}
          </span>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border/70 pt-4">
        <div>
          <p className="font-mono text-xs font-semibold">
            {formatCompact(data.stats.commits)}
          </p>
          <p className="text-[9px] text-muted-foreground">Commits</p>
        </div>
        <div>
          <p className="font-mono text-xs font-semibold">
            {formatCompact(data.stats.stars)}
          </p>
          <p className="text-[9px] text-muted-foreground">Stars</p>
        </div>
        <div>
          <p className="font-mono text-xs font-semibold">{data.insights.consistency}%</p>
          <p className="text-[9px] text-muted-foreground">Consistency</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <Link
          href={`/u/${data.user.login}`}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline"
        >
          Open dashboard
          <ArrowUpRight className="size-3.5" aria-hidden />
        </Link>
        <FavoriteButton
          username={data.user.login}
          initialSaved
          isSignedIn
        />
      </div>
    </Card>
  );
}
