import { describe, expect, it } from "vitest";

import type { LanguageSlice, ProfileData } from "@/lib/github/normalize";
import { calculateScore } from "@/lib/score/calculate";

function stats(overrides: Partial<ProfileData["stats"]> = {}): ProfileData["stats"] {
  return {
    commits: 0,
    stars: 0,
    pullRequests: 0,
    issues: 0,
    reviews: 0,
    publicRepos: 0,
    followers: 0,
    following: 0,
    totalContributions: 0,
    restrictedContributions: 0,
    longestStreak: 0,
    currentStreak: 0,
    activeDays: 0,
    activeWeeks: 0,
    totalWeeks: 0,
    ...overrides,
  };
}

function languages(count: number): LanguageSlice[] {
  return Array.from({ length: count }, (_, index) => ({
    name: `Language ${index}`,
    color: "#3178c6",
    size: 100 - index,
    percent: 10,
  }));
}

describe("calculateScore", () => {
  it("returns a zero score and an E grade for an empty profile", () => {
    const score = calculateScore({
      stats: stats(),
      languages: [],
      contributions: [],
    });

    expect(score.total).toBe(0);
    expect(score.grade).toBe("E");
    expect(score.categories.map((category) => category.score)).toEqual([
      0, 0, 0, 0,
    ]);
    expect(score.categories.map((category) => category.max)).toEqual([
      30, 25, 30, 15,
    ]);
  });

  it("caps every category and reaches 100 for an elite profile", () => {
    const score = calculateScore({
      stats: stats({
        commits: 4_000,
        stars: 100_000,
        pullRequests: 100,
        issues: 50,
        reviews: 100,
        publicRepos: 50,
        followers: 50_000,
        activeDays: 365,
        longestStreak: 100,
      }),
      languages: languages(6),
      contributions: [],
    });

    expect(score.categories.map((category) => category.score)).toEqual([
      30, 25, 30, 15,
    ]);
    expect(score.total).toBe(100);
    expect(score.grade).toBe("S");
    expect(score.label).toBe("Elite");
  });

  it("uses log scaling so modest profiles still score", () => {
    const score = calculateScore({
      stats: stats({
        commits: 120,
        stars: 8,
        pullRequests: 4,
        issues: 3,
        reviews: 1,
        publicRepos: 4,
        followers: 12,
        activeDays: 60,
        longestStreak: 7,
      }),
      languages: languages(3),
      contributions: [],
    });

    expect(score.total).toBeGreaterThan(0);
    expect(score.total).toBeLessThan(60);
    expect(score.categories[0].score).toBeGreaterThan(0);
    expect(score.categories[1].score).toBeGreaterThan(0);
  });

  it("exposes transparent details and a generated summary", () => {
    const score = calculateScore({
      stats: stats({
        commits: 1_200,
        stars: 1_500,
        pullRequests: 20,
        issues: 10,
        publicRepos: 12,
        followers: 200,
        activeDays: 120,
        longestStreak: 20,
      }),
      languages: languages(4),
      contributions: [],
    });

    expect(score.categories.every((category) => category.explanation.length > 0)).toBe(
      true,
    );
    expect(score.categories.every((category) => category.detail.length > 0)).toBe(
      true,
    );
    expect(score.summary).toMatch(/Strongest in/i);
    expect(score.summary).toMatch(/room to grow/i);
  });
});
