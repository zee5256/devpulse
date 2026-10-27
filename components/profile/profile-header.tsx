import {
  ArrowLeftRight,
  CalendarDays,
  MapPin,
  Star,
  Users,
} from "lucide-react";
import Link from "next/link";

import { FavoriteButton } from "@/components/profile/favorite-button";
import { ShareMenu } from "@/components/profile/share-menu";
import { GithubIcon } from "@/components/ui/brand-icons";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ProfileData } from "@/lib/github/normalize";
import type { DeveloperScore } from "@/lib/score/calculate";
import { formatJoinDate, formatNumber } from "@/lib/utils";

export function ProfileHeader({
  data,
  score,
  isSignedIn,
  initialSaved,
}: {
  data: ProfileData;
  score: DeveloperScore;
  isSignedIn: boolean;
  initialSaved: boolean;
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] sm:p-7">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-30 dark:opacity-20" />
      <div className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full bg-accent/10 blur-3xl" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="relative shrink-0">
            <Avatar
              src={data.user.avatarUrl}
              alt={data.user.name ?? data.user.login}
              name={data.user.name}
              login={data.user.login}
              className="size-20 border-2 border-background ring-4 ring-accent/15 sm:size-24"
              fallbackClassName="text-xl"
            />
            <span className="absolute -bottom-1 -right-1 grid size-8 place-items-center rounded-full border-2 border-card bg-accent text-[10px] font-bold text-accent-foreground shadow-sm">
              {score.grade}
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                {data.user.name ?? data.user.login}
              </h1>
              <Badge variant="success" className="gap-1">
                <Star className="size-3" aria-hidden />
                {score.total}/100
              </Badge>
            </div>
            <p className="mt-1 font-mono text-sm text-muted-foreground">
              @{data.user.login}
            </p>
            {data.user.bio ? (
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground/80">
                {data.user.bio}
              </p>
            ) : (
              <p className="mt-3 max-w-2xl text-sm italic text-muted-foreground">
                No bio on GitHub yet.
              </p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
              {data.user.location ? (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-3.5" aria-hidden />
                  {data.user.location}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-3.5" aria-hidden />
                Joined {formatJoinDate(data.user.createdAt)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="size-3.5" aria-hidden />
                {formatNumber(data.user.followers)} followers
              </span>
              <span className="inline-flex items-center gap-1.5">
                Following {formatNumber(data.user.following)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FavoriteButton
            username={data.user.login}
            initialSaved={initialSaved}
            isSignedIn={isSignedIn}
          />
          <ShareMenu username={data.user.login} />
          <Button variant="outline" asChild>
            <Link href={`/compare?a=${data.user.login}`}>
              <ArrowLeftRight aria-hidden />
              Compare
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <a
              href={data.user.profileUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`Open @${data.user.login} on GitHub`}
            >
              <GithubIcon aria-hidden />
              <span className="sr-only">GitHub</span>
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
