import { describe, expect, it } from "vitest";

import {
  aggregateLanguages,
  buildMonthlySeries,
  computeStreaks,
  mostActiveWeekday,
  normalizeGithubUser,
} from "@/lib/github/normalize";
import type { GithubRepository, GithubUser } from "@/lib/github/schemas";

function repository(
  overrides: Partial<GithubRepository> = {},
): GithubRepository {
  return {
    name: "example",
    description: "An example repository",
    url: "https://github.com/octocat/example",
    stargazerCount: 10,
    forkCount: 2,
    updatedAt: "2026-10-01T12:00:00Z",
    isArchived: false,
    primaryLanguage: { name: "TypeScript", color: "#3178c6" },
    languages: {
      edges: [
        { size: 100, node: { name: "TypeScript", color: "#3178c6" } },
        { size: 50, node: { name: "CSS", color: "#563d7c" } },
      ],
    },
    ...overrides,
  };
}

const user: GithubUser = {
  login: "octocat",
  name: "The Octocat",
  avatarUrl: "https://avatars.githubusercontent.com/u/583231",
  bio: "A friendly neighborhood developer.",
  location: "San Francisco",
  createdAt: "2011-01-25T18:44:36Z",
  url: "https://github.com/octocat",
  followers: { totalCount: 1_000 },
  following: { totalCount: 9 },
  repositories: {
    totalCount: 8,
    nodes: [
      repository({
        name: "alpha",
        stargazerCount: 10,
        languages: {
          edges: [
            { size: 100, node: { name: "TypeScript", color: "#3178c6" } },
            { size: 50, node: { name: "CSS", color: "#563d7c" } },
          ],
        },
      }),
      repository({
        name: "beta",
        stargazerCount: 50,
        primaryLanguage: { name: "Rust", color: "#dea584" },
        languages: { edges: [] },
      }),
    ],
  },
  contributionsCollection: {
    totalCommitContributions: 100,
    totalPullRequestContributions: 5,
    totalIssueContributions: 2,
    totalPullRequestReviewContributions: 3,
    restrictedContributionsCount: 4,
    contributionCalendar: {
      totalContributions: 120,
      weeks: [
        {
          contributionDays: [
            { date: "2026-01-01", contributionCount: 1, weekday: 4 },
            { date: "2026-01-02", contributionCount: 2, weekday: 5 },
          ],
        },
        {
          contributionDays: [
            { date: "2026-01-03", contributionCount: 0, weekday: 6 },
          ],
        },
      ],
    },
  },
};

describe("computeStreaks", () => {
  it("finds the longest run and the current run at the end of the range", () => {
    const result = computeStreaks([
      { date: "2026-01-01", count: 1 },
      { date: "2026-01-02", count: 2 },
      { date: "2026-01-03", count: 3 },
      { date: "2026-01-04", count: 0 },
      { date: "2026-01-05", count: 1 },
      { date: "2026-01-06", count: 1 },
    ]);

    expect(result).toEqual({ longestStreak: 3, currentStreak: 2 });
  });

  it("handles an all-empty range", () => {
    const result = computeStreaks([
      { date: "2026-01-01", count: 0 },
      { date: "2026-01-02", count: 0 },
    ]);

    expect(result).toEqual({ longestStreak: 0, currentStreak: 0 });
  });
});

describe("buildMonthlySeries", () => {
  it("builds a stable 12-month series with empty months filled in", () => {
    const series = buildMonthlySeries(
      [
        { date: "2026-01-01", count: 2 },
        { date: "2026-01-15", count: 3 },
        { date: "2026-03-10", count: 4 },
      ],
      12,
      new Date("2026-10-15T00:00:00Z"),
    );

    expect(series).toHaveLength(12);
    expect(series[0].month).toBe("2025-11");
    expect(series[series.length - 1].month).toBe("2026-10");
    expect(series.find((point) => point.month === "2026-01")?.contributions).toBe(5);
    expect(series.find((point) => point.month === "2026-02")?.contributions).toBe(0);
    expect(series.find((point) => point.month === "2026-03")?.contributions).toBe(4);
  });
});

describe("aggregateLanguages", () => {
  it("aggregates language sizes and falls back to primary languages", () => {
    const languages = aggregateLanguages([
      repository(),
      repository({
        name: "rusty",
        primaryLanguage: { name: "Rust", color: "#dea584" },
        languages: { edges: [] },
      }),
    ]);

    expect(languages.map((language) => language.name)).toEqual([
      "TypeScript",
      "CSS",
      "Rust",
    ]);
    expect(languages[0].percent).toBe(66);
    expect(languages[1].percent).toBe(33);
    expect(languages[2].percent).toBe(1);
  });

  it("groups the long tail into Other", () => {
    const repos = Array.from({ length: 9 }, (_, index) =>
      repository({
        name: `repo-${index}`,
        languages: {
          edges: [
            {
              size: 100 - index * 5,
              node: { name: `Language ${index}`, color: "#3178c6" },
            },
          ],
        },
      }),
    );

    const languages = aggregateLanguages(repos);

    expect(languages).toHaveLength(8);
    expect(languages[languages.length - 1].name).toBe("Other");
    expect(languages.reduce((sum, language) => sum + language.percent, 0)).toBeGreaterThanOrEqual(
      98,
    );
  });
});

describe("mostActiveWeekday", () => {
  it("returns the weekday with the highest contribution total", () => {
    const result = mostActiveWeekday([
      { weekday: 1, count: 2 },
      { weekday: 2, count: 9 },
      { weekday: 2, count: 1 },
      { weekday: 5, count: 4 },
    ]);

    expect(result).toEqual({ name: "Tuesday", count: 10 });
  });
});

describe("normalizeGithubUser", () => {
  it("maps raw GraphQL data into the dashboard shape", () => {
    const data = normalizeGithubUser(user, {
      now: new Date("2026-01-15T00:00:00Z"),
      from: new Date("2025-01-15T00:00:00Z"),
      to: new Date("2026-01-15T00:00:00Z"),
    });

    expect(data.user.login).toBe("octocat");
    expect(data.user.name).toBe("The Octocat");
    expect(data.stats.commits).toBe(100);
    expect(data.stats.stars).toBe(60);
    expect(data.stats.publicRepos).toBe(8);
    expect(data.stats.longestStreak).toBe(2);
    expect(data.stats.currentStreak).toBe(0);
    expect(data.stats.activeDays).toBe(2);
    expect(data.stats.activeWeeks).toBe(1);
    expect(data.stats.totalWeeks).toBe(2);
    expect(data.stats.restrictedContributions).toBe(4);
    expect(data.topRepos.map((repo) => repo.name)).toEqual(["beta", "alpha"]);
    expect(data.languages[0].name).toBe("TypeScript");
    expect(data.insights.mostActiveWeekday).toBe("Friday");
    expect(data.insights.favoriteLanguage).toBe("TypeScript");
    expect(data.insights.consistency).toBe(67);
    expect(data.insights.busiestMonth).toBe("Jan");
    expect(data.meta.repositorySampleSize).toBe(2);
    expect(data.contributions).toHaveLength(3);
    expect(data.contributions.map((day) => day.weekIndex)).toEqual([0, 0, 1]);
  });
});
