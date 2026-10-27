import type { Metadata } from "next";
import {
  ArrowLeft,
  ArrowLeftRight,
  CircleDot,
  Flame,
  FolderGit2,
  GitCommitHorizontal,
  GitPullRequest,
  RefreshCw,
  Star,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CommitChart } from "@/components/profile/commit-chart";
import { ContributionHeatmap } from "@/components/profile/contribution-heatmap";
import { LanguageDonut } from "@/components/profile/language-donut";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ScoreBreakdown } from "@/components/profile/score-breakdown";
import { SmartInsights } from "@/components/profile/smart-insights";
import { SnapshotCard } from "@/components/profile/snapshot-card";
import { StatCard } from "@/components/profile/stat-card";
import { TopRepositories } from "@/components/profile/top-repositories";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/state-panel";
import { auth } from "@/lib/auth";
import {
  getProfileForPage,
  type ProfileResult,
} from "@/lib/cache/profile";
import { siteConfig } from "@/lib/constants";
import {
  githubErrorMessage,
  isGithubError,
} from "@/lib/github/errors";
import {
  isRateLimitExceeded,
} from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { usernameSchema } from "@/lib/validations";
import { formatNumber, relativeTime } from "@/lib/utils";

type PageProps = { params: Promise<{ username: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const raw = await params;
  const parsed = usernameSchema.safeParse(raw.username);
  if (!parsed.success) return { title: "Developer not found" };

  try {
    const profile = await getProfileForPage(parsed.data);
    const name = profile.data.user.name ?? profile.data.user.login;
    const title = `${name} (@${profile.data.user.login}) — GitHub analytics`;
    const description =
      profile.data.user.bio ??
      `${formatNumber(profile.data.stats.totalContributions)} contributions, ${formatNumber(profile.data.stats.stars)} stars, and a Developer Score of ${profile.score.total}/100.`;
    const image = `/u/${profile.data.user.login}/opengraph-image`;

    return {
      title,
      description,
      alternates: { canonical: `/u/${profile.data.user.login}` },
      openGraph: {
        type: "profile",
        title,
        description,
        url: `/u/${profile.data.user.login}`,
        images: [{ url: image, width: 1200, height: 630, alt: title }],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [image],
      },
    };
  } catch {
    return { title: `@${parsed.data} — GitHub analytics` };
  }
}

function ProfileError({
  error,
  username,
}: {
  error: unknown;
  username: string;
}) {
  if (isRateLimitExceeded(error)) {
    return (
      <ErrorState
        title="A little too fast"
        message={`You have reached the profile request limit. Try again in about ${Math.ceil(
          error.retryAfterSeconds / 60,
        )} minutes.`}
        retryHref={`/u/${username}`}
      />
    );
  }

  const message = githubErrorMessage(error);
  return (
    <ErrorState
      title={message.title}
      message={message.message}
      retryHref={message.canRetry ? `/u/${username}` : undefined}
    >
      <p className="mt-6 max-w-sm text-xs leading-relaxed text-muted-foreground">
        Tip: cached profiles still render during GitHub outages, and the landing
        page has demo profiles you can explore.
      </p>
    </ErrorState>
  );
}

export default async function ProfilePage({ params }: PageProps) {
  const raw = await params;
  const parsed = usernameSchema.safeParse(raw.username);
  if (!parsed.success) notFound();

  const username = parsed.data;
  let profile: ProfileResult;

  try {
    profile = await getProfileForPage(username);
  } catch (error) {
    if (isGithubError(error) && error.code === "NOT_FOUND") notFound();
    console.error(`Profile load failed for ${username}:`, error);
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <ProfileError error={error} username={username} />
      </div>
    );
  }

  const session = await auth();
  const isSignedIn = Boolean(session?.user?.id);
  let initialSaved = false;
  if (session?.user?.id) {
    initialSaved = Boolean(
      await prisma.favorite.findUnique({
        where: {
          userId_username: {
            userId: session.user.id,
            username: profile.data.user.login.toLowerCase(),
          },
        },
        select: { id: true },
      }),
    );
  }

  const { data, score } = profile;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/">
            <ArrowLeft aria-hidden />
            Back to search
          </Link>
        </Button>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <Badge variant="muted">@{data.user.login}</Badge>
          <span>Updated {relativeTime(profile.fetchedAt)}</span>
        </div>
      </div>

      <ProfileHeader
        data={data}
        score={score}
        isSignedIn={isSignedIn}
        initialSaved={initialSaved}
      />

      {profile.stale ? (
        <div
          role="status"
          className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-warning/25 bg-warning/10 px-4 py-2.5 text-xs text-warning"
        >
          <RefreshCw className="size-3.5" aria-hidden />
          {profile.warning ??
            "Showing a cached snapshot while DevPulse refreshes this profile."}
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            <StatCard
              icon={GitCommitHorizontal}
              label="Commits"
              value={data.stats.commits}
              detail={`${formatNumber(data.stats.totalContributions)} contributions`}
              index={0}
            />
            <StatCard
              icon={Star}
              label="Stars earned"
              value={data.stats.stars}
              detail={`${data.stats.publicRepos} public repos`}
              compact
              index={1}
            />
            <StatCard
              icon={GitPullRequest}
              label="Pull requests"
              value={data.stats.pullRequests}
              detail={`${formatNumber(data.stats.reviews)} reviews`}
              index={2}
            />
            <StatCard
              icon={CircleDot}
              label="Issues opened"
              value={data.stats.issues}
              detail={`${formatNumber(data.stats.activeDays)} active days`}
              index={3}
            />
            <StatCard
              icon={FolderGit2}
              label="Public repos"
              value={data.stats.publicRepos}
              detail={`${data.topRepos.length} top projects`}
              index={4}
            />
            <StatCard
              icon={Flame}
              label="Longest streak"
              value={data.stats.longestStreak}
              detail={`Current streak: ${data.stats.currentStreak} days`}
              suffix=" days"
              index={5}
            />
          </div>

          <Card className="overflow-hidden">
            <CardHeader className="flex-row items-start justify-between gap-3 pb-2">
              <div>
                <CardTitle>Contribution activity</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  The last 12 months, straight from GitHub&apos;s contribution calendar.
                </p>
              </div>
              <Badge variant="default" className="shrink-0">
                {formatNumber(data.stats.totalContributions)} total
              </Badge>
            </CardHeader>
            <CardContent>
              <ContributionHeatmap
                days={data.contributions}
                username={data.user.login}
              />
              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border/70 pt-4 text-xs sm:grid-cols-4">
                <div>
                  <p className="font-display text-lg font-bold">
                    {data.stats.activeDays}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Active days</p>
                </div>
                <div>
                  <p className="font-display text-lg font-bold">
                    {data.stats.activeWeeks}/{data.stats.totalWeeks}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Active weeks</p>
                </div>
                <div>
                  <p className="font-display text-lg font-bold">
                    {data.stats.currentStreak}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Current streak</p>
                </div>
                <div>
                  <p className="font-display text-lg font-bold">
                    {data.insights.consistency}%
                  </p>
                  <p className="text-[10px] text-muted-foreground">Consistency</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Language breakdown</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Aggregated by repository language size.
                </p>
              </CardHeader>
              <CardContent>
                <LanguageDonut languages={data.languages} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Contribution trend</CardTitle>
                <p className="text-xs text-muted-foreground">
                  A rolling view of your contribution calendar.
                </p>
              </CardHeader>
              <CardContent>
                <CommitChart monthly={data.monthly} />
              </CardContent>
            </Card>
          </div>

          <section aria-labelledby="insights-heading">
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <h2 id="insights-heading" className="font-display text-lg font-semibold">
                  Smart insights
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Patterns worth knowing, computed from the same snapshot.
                </p>
              </div>
            </div>
            <SmartInsights data={data} />
          </section>

          <Card>
            <CardHeader className="flex-row items-center justify-between gap-3 pb-3">
              <div>
                <CardTitle>Top repositories</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  Ranked by stars across owned, non-fork repositories.
                </p>
              </div>
              <Badge variant="muted">{data.topRepos.length} shown</Badge>
            </CardHeader>
            <CardContent>
              <TopRepositories repos={data.topRepos} />
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <ScoreBreakdown score={score} />
          <SnapshotCard profile={profile} />

          <Card className="relative overflow-hidden p-5">
            <div className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-accent/10 blur-2xl" />
            <div className="flex items-center gap-2 text-xs font-semibold">
              <ArrowLeftRight className="size-4 text-accent" aria-hidden />
              How do you compare?
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Put @{data.user.login} head-to-head with another developer and see
              the score categories on a radar chart.
            </p>
            <Button variant="secondary" size="sm" className="mt-4 w-full" asChild>
              <Link href={`/compare?a=${data.user.login}`}>
                Start a comparison
                <ArrowLeftRight className="size-3.5" aria-hidden />
              </Link>
            </Button>
          </Card>

          <p className="px-1 text-[10px] leading-relaxed text-muted-foreground">
            DevPulse is independent and not affiliated with GitHub. Data is
            normalized from the public GitHub GraphQL API.
          </p>
        </aside>
      </div>

      <p className="mt-8 text-center text-[10px] text-muted-foreground">
        {siteConfig.name} · Public data, transparent scoring, no tracking pixels.
      </p>
    </div>
  );
}
