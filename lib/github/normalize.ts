import type { GithubRepository, GithubUser } from "./schemas";

export type ContributionDay = {
  date: string;
  count: number;
  weekday: number;
  weekIndex: number;
};

export type MonthlyPoint = {
  month: string;
  label: string;
  contributions: number;
};

export type LanguageSlice = {
  name: string;
  color: string;
  size: number;
  percent: number;
};

export type TopRepository = {
  name: string;
  description: string | null;
  url: string;
  stars: number;
  forks: number;
  language: string | null;
  languageColor: string;
  updatedAt: string;
};

export type ProfileData = {
  user: {
    login: string;
    name: string | null;
    avatarUrl: string;
    bio: string | null;
    location: string | null;
    createdAt: string;
    profileUrl: string;
    followers: number;
    following: number;
  };
  stats: {
    commits: number;
    stars: number;
    pullRequests: number;
    issues: number;
    reviews: number;
    publicRepos: number;
    followers: number;
    following: number;
    totalContributions: number;
    restrictedContributions: number;
    longestStreak: number;
    currentStreak: number;
    activeDays: number;
    activeWeeks: number;
    totalWeeks: number;
  };
  contributions: ContributionDay[];
  monthly: MonthlyPoint[];
  languages: LanguageSlice[];
  topRepos: TopRepository[];
  insights: {
    mostActiveWeekday: string;
    mostActiveWeekdayCount: number;
    favoriteLanguage: string;
    favoriteLanguagePercent: number;
    consistency: number;
    busiestMonth: string;
    busiestMonthCount: number;
  };
  meta: {
    from: string;
    to: string;
    generatedAt: string;
    repositorySampleSize: number;
  };
};

const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

const FALLBACK_LANGUAGE_COLOR = "#8b949e";
const OTHER_LANGUAGE_COLOR = "#64748b";

function monthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string): string {
  const [year, month] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

export function computeStreaks(days: Pick<ContributionDay, "date" | "count">[]) {
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  let longest = 0;
  let running = 0;
  let current = 0;

  for (const day of sorted) {
    if (day.count > 0) {
      running += 1;
      longest = Math.max(longest, running);
    } else {
      running = 0;
    }
  }

  for (let index = sorted.length - 1; index >= 0; index -= 1) {
    if (sorted[index].count > 0) current += 1;
    else break;
  }

  return { longestStreak: longest, currentStreak: current };
}

export function buildMonthlySeries(
  days: Pick<ContributionDay, "date" | "count">[],
  months = 12,
  now = new Date(),
): MonthlyPoint[] {
  const counts = new Map<string, number>();
  for (const day of days) {
    const key = day.date.slice(0, 7);
    counts.set(key, (counts.get(key) ?? 0) + day.count);
  }

  const series: MonthlyPoint[] = [];
  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const date = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1),
    );
    const key = monthKey(date);
    series.push({
      month: key,
      label: monthLabel(key),
      contributions: counts.get(key) ?? 0,
    });
  }
  return series;
}

export function aggregateLanguages(
  repositories: Pick<GithubRepository, "languages" | "primaryLanguage">[],
): LanguageSlice[] {
  const totals = new Map<string, { size: number; color: string }>();

  for (const repository of repositories) {
    const edges = repository.languages?.edges ?? [];
    if (edges.length === 0 && repository.primaryLanguage) {
      const language = repository.primaryLanguage;
      const current = totals.get(language.name) ?? {
        size: 0,
        color: language.color ?? FALLBACK_LANGUAGE_COLOR,
      };
      current.size += 1;
      totals.set(language.name, current);
      continue;
    }

    for (const edge of edges) {
      if (edge.size <= 0) continue;
      const current = totals.get(edge.node.name) ?? {
        size: 0,
        color: edge.node.color ?? FALLBACK_LANGUAGE_COLOR,
      };
      current.size += edge.size;
      totals.set(edge.node.name, current);
    }
  }

  const sorted = [...totals.entries()]
    .map(([name, value]) => ({ name, ...value }))
    .sort((a, b) => b.size - a.size);

  if (sorted.length === 0) return [];

  const total = sorted.reduce((sum, language) => sum + language.size, 0);
  const top = sorted.slice(0, 7);
  const rest = sorted.slice(7);
  if (rest.length > 0) {
    top.push({
      name: "Other",
      size: rest.reduce((sum, language) => sum + language.size, 0),
      color: OTHER_LANGUAGE_COLOR,
    });
  }

  return top.map((language) => ({
    name: language.name,
    color: language.color || FALLBACK_LANGUAGE_COLOR,
    size: language.size,
    percent: Math.round((language.size / total) * 100),
  }));
}

export function mostActiveWeekday(
  days: Pick<ContributionDay, "weekday" | "count">[],
): { name: string; count: number } {
  const totals = new Array<number>(7).fill(0);
  for (const day of days) {
    if (day.weekday >= 0 && day.weekday < 7) totals[day.weekday] += day.count;
  }
  let index = 0;
  for (let day = 1; day < 7; day += 1) {
    if (totals[day] > totals[index]) index = day;
  }
  return { name: WEEKDAY_NAMES[index], count: totals[index] };
}

export function normalizeGithubUser(
  user: GithubUser,
  options: { now?: Date; from?: Date; to?: Date } = {},
): ProfileData {
  const now = options.now ?? new Date();
  const to = options.to ?? now;
  const from = options.from ?? new Date(to.getTime() - 365 * 24 * 60 * 60 * 1000);

  const collection = user.contributionsCollection;
  const contributions: ContributionDay[] = (collection?.contributionCalendar.weeks ?? [])
    .flatMap((week, weekIndex) =>
      week.contributionDays.map((day) => ({
        date: day.date,
        count: day.contributionCount,
        weekday: day.weekday,
        weekIndex,
      })),
    )
    .sort((a, b) => a.date.localeCompare(b.date));

  const { longestStreak, currentStreak } = computeStreaks(contributions);
  const activeDays = contributions.filter((day) => day.count > 0).length;
  const activeWeeks = (collection?.contributionCalendar.weeks ?? []).filter((week) =>
    week.contributionDays.some((day) => day.contributionCount > 0),
  ).length;
  const totalWeeks = collection?.contributionCalendar.weeks.length ?? 0;
  const monthly = buildMonthlySeries(contributions, 12, now);
  const languages = aggregateLanguages(user.repositories.nodes);
  const weekday = mostActiveWeekday(contributions);
  const busiest = [...monthly].sort((a, b) => b.contributions - a.contributions)[0];

  const repositories = [...user.repositories.nodes].sort(
    (a, b) => b.stargazerCount - a.stargazerCount,
  );
  const stars = repositories.reduce(
    (sum, repository) => sum + repository.stargazerCount,
    0,
  );

  return {
    user: {
      login: user.login,
      name: user.name ?? null,
      avatarUrl: user.avatarUrl,
      bio: user.bio ?? null,
      location: user.location ?? null,
      createdAt: user.createdAt,
      profileUrl: user.url,
      followers: user.followers.totalCount,
      following: user.following.totalCount,
    },
    stats: {
      commits: collection?.totalCommitContributions ?? 0,
      stars,
      pullRequests: collection?.totalPullRequestContributions ?? 0,
      issues: collection?.totalIssueContributions ?? 0,
      reviews: collection?.totalPullRequestReviewContributions ?? 0,
      publicRepos: user.repositories.totalCount,
      followers: user.followers.totalCount,
      following: user.following.totalCount,
      totalContributions: collection?.contributionCalendar.totalContributions ?? 0,
      restrictedContributions: collection?.restrictedContributionsCount ?? 0,
      longestStreak,
      currentStreak,
      activeDays,
      activeWeeks,
      totalWeeks,
    },
    contributions,
    monthly,
    languages,
    topRepos: repositories.slice(0, 6).map((repository) => ({
      name: repository.name,
      description: repository.description ?? null,
      url: repository.url,
      stars: repository.stargazerCount,
      forks: repository.forkCount,
      language: repository.primaryLanguage?.name ?? null,
      languageColor:
        repository.primaryLanguage?.color ?? FALLBACK_LANGUAGE_COLOR,
      updatedAt: repository.updatedAt,
    })),
    insights: {
      mostActiveWeekday: weekday.name,
      mostActiveWeekdayCount: weekday.count,
      favoriteLanguage: languages[0]?.name ?? "Not enough data",
      favoriteLanguagePercent: languages[0]?.percent ?? 0,
      consistency:
        contributions.length > 0
          ? Math.round((activeDays / contributions.length) * 100)
          : 0,
      busiestMonth: busiest?.label ?? "—",
      busiestMonthCount: busiest?.contributions ?? 0,
    },
    meta: {
      from: from.toISOString(),
      to: to.toISOString(),
      generatedAt: now.toISOString(),
      repositorySampleSize: repositories.length,
    },
  };
}
