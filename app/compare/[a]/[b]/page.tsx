import type { Metadata } from "next";
import {
  ArrowLeft,
  ArrowLeftRight,
  ArrowUpRight,
  GitFork,
  Star,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { CompareForm } from "@/components/compare/compare-form";
import {
  CompareCategoryGrid,
  CompareStatTable,
} from "@/components/compare/comparison-table";
import { CompareRadar } from "@/components/compare/radar-chart";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/state-panel";
import { getProfileForPage, type ProfileResult } from "@/lib/cache/profile";
import {
  githubErrorMessage,
  isGithubError,
} from "@/lib/github/errors";
import { isRateLimitExceeded } from "@/lib/rate-limit";
import { usernameSchema } from "@/lib/validations";
import { formatCompact } from "@/lib/utils";

type PageProps = { params: Promise<{ a: string; b: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { a, b } = await params;
  const left = usernameSchema.safeParse(a);
  const right = usernameSchema.safeParse(b);
  if (!left.success || !right.success) return { title: "Compare developers" };

  try {
    const [first, second] = await Promise.all([
      getProfileForPage(left.data),
      getProfileForPage(right.data),
    ]);
    const title = `@${first.data.user.login} vs @${second.data.user.login}`;
    return {
      title,
      description: `Compare ${first.data.user.login} (${first.score.total}/100) and ${second.data.user.login} (${second.score.total}/100) across activity, consistency, impact, and diversity.`,
      alternates: { canonical: `/compare/${left.data}/${right.data}` },
      openGraph: {
        title: `${title} — DevPulse`,
        description: "A side-by-side GitHub developer comparison.",
        url: `/compare/${left.data}/${right.data}`,
      },
    };
  } catch {
    return { title: "Compare developers" };
  }
}

function SummaryCard({
  profile,
  label,
  winner,
}: {
  profile: ProfileResult;
  label: "A" | "B";
  winner: boolean;
}) {
  const { data, score } = profile;
  return (
    <Card
      className={
        winner
          ? "relative overflow-hidden border-accent/40 bg-accent-soft/20 p-5"
          : "relative overflow-hidden p-5"
      }
    >
      {winner ? (
        <div className="absolute right-4 top-4">
          <Badge variant="success">
            <Trophy className="size-3" aria-hidden />
            Leader
          </Badge>
        </div>
      ) : null}
      <div className="flex items-center gap-3">
        <span className="grid size-7 place-items-center rounded-lg bg-muted font-mono text-[11px] font-bold text-muted-foreground">
          {label}
        </span>
        <Avatar
          src={data.user.avatarUrl}
          alt={data.user.name ?? data.user.login}
          name={data.user.name}
          login={data.user.login}
          className="size-12 ring-2 ring-accent/15 ring-offset-2 ring-offset-card"
        />
        <div className="min-w-0">
          <p className="truncate font-display text-base font-semibold">
            {data.user.name ?? data.user.login}
          </p>
          <p className="truncate font-mono text-[11px] text-muted-foreground">
            @{data.user.login}
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Score
          </p>
          <p className="mt-1 font-display text-4xl font-bold leading-none">
            {score.total}
            <span className="ml-1 text-sm font-medium text-muted-foreground">
              /100
            </span>
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Grade {score.grade} · {score.label}
          </p>
        </div>
        <Link
          href={`/u/${data.user.login}`}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline"
        >
          Profile
          <ArrowUpRight className="size-3.5" aria-hidden />
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border/70 pt-4">
        <div>
          <p className="font-mono text-xs font-semibold">
            {formatCompact(data.stats.commits)}
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-[9px] text-muted-foreground">
            <GitFork className="size-2.5" aria-hidden /> Commits
          </p>
        </div>
        <div>
          <p className="font-mono text-xs font-semibold">
            {formatCompact(data.stats.stars)}
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-[9px] text-muted-foreground">
            <Star className="size-2.5" aria-hidden /> Stars
          </p>
        </div>
        <div>
          <p className="font-mono text-xs font-semibold">
            {formatCompact(data.stats.publicRepos)}
          </p>
          <p className="mt-0.5 text-[9px] text-muted-foreground">Repos</p>
        </div>
      </div>
    </Card>
  );
}

export default async function CompareDetailPage({ params }: PageProps) {
  const { a, b } = await params;
  const left = usernameSchema.safeParse(a);
  const right = usernameSchema.safeParse(b);
  if (!left.success || !right.success) notFound();
  if (left.data === right.data) redirect(`/u/${left.data}`);

  let first: ProfileResult;
  let second: ProfileResult;
  try {
    [first, second] = await Promise.all([
      getProfileForPage(left.data),
      getProfileForPage(right.data),
    ]);
  } catch (error) {
    if (isGithubError(error) && error.code === "NOT_FOUND") notFound();
    if (isRateLimitExceeded(error)) {
      return (
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
          <ErrorState
            title="A little too fast"
            message={`The comparison request limit was reached. Try again in about ${Math.ceil(
              error.retryAfterSeconds / 60,
            )} minutes.`}
            retryHref={`/compare/${left.data}/${right.data}`}
          />
        </div>
      );
    }
    const message = githubErrorMessage(error);
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <ErrorState
          title={message.title}
          message={message.message}
          retryHref={message.canRetry ? `/compare/${left.data}/${right.data}` : undefined}
        />
      </div>
    );
  }

  const aWinner = first.score.total > second.score.total;
  const bWinner = second.score.total > first.score.total;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <h1 className="sr-only">
        Compare @{first.data.user.login} and @{second.data.user.login}
      </h1>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/compare">
            <ArrowLeft aria-hidden />
            All comparisons
          </Link>
        </Button>
        <Badge variant="muted">
          <ArrowLeftRight className="size-3" aria-hidden />
          Head to head
        </Badge>
      </div>

      <div className="mb-6">
        <CompareForm
          initialA={first.data.user.login}
          initialB={second.data.user.login}
          compact
        />
      </div>

      <div className="grid items-stretch gap-3 lg:grid-cols-[1fr_auto_1fr]">
        <SummaryCard profile={first} label="A" winner={aWinner} />
        <div className="hidden items-center justify-center lg:flex">
          <span className="grid size-12 place-items-center rounded-full border border-border bg-card font-display text-xs font-bold text-muted-foreground shadow-sm">
            VS
          </span>
        </div>
        <SummaryCard profile={second} label="B" winner={bWinner} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Score shape</CardTitle>
            <p className="text-xs text-muted-foreground">
              Category percentages, so every spoke is on the same 0–100 scale.
            </p>
          </CardHeader>
          <CardContent>
            <CompareRadar a={first} b={second} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Category breakdown</CardTitle>
            <p className="text-xs text-muted-foreground">
              Raw points earned out of each pillar&apos;s maximum.
            </p>
          </CardHeader>
          <CardContent>
            <CompareCategoryGrid a={first} b={second} />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader className="flex-row items-center justify-between gap-3 pb-2">
          <div>
            <CardTitle>Every stat, side by side</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              The higher value is highlighted. Ties stay neutral.
            </p>
          </div>
          <Badge variant="muted">12 months</Badge>
        </CardHeader>
        <CardContent>
          <CompareStatTable a={first} b={second} />
        </CardContent>
      </Card>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button variant="secondary" asChild>
          <Link href={`/u/${first.data.user.login}`}>
            Explore @{first.data.user.login}
          </Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link href={`/u/${second.data.user.login}`}>
            Explore @{second.data.user.login}
          </Link>
        </Button>
      </div>
    </div>
  );
}
