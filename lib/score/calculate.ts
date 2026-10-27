import type { ProfileData } from "@/lib/github/normalize";
import { formatCompact } from "@/lib/utils";

export type ScoreKey = "activity" | "consistency" | "impact" | "diversity";

export type ScoreCategory = {
  key: ScoreKey;
  label: string;
  score: number;
  max: number;
  detail: string;
  explanation: string;
};

export type DeveloperScore = {
  total: number;
  grade: "S" | "A" | "B" | "C" | "D" | "E";
  label: string;
  summary: string;
  categories: ScoreCategory[];
};

type ScoreInput = Pick<ProfileData, "stats" | "languages" | "contributions">;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function logScore(value: number, saturation: number): number {
  return clamp(Math.log10(1 + Math.max(0, value)) / Math.log10(1 + saturation), 0, 1);
}

/**
 * DevPulse Developer Score — 100 points across four transparent pillars.
 *
 * Activity (30): log-scaled volume of commits, PRs, issues, and reviews.
 * Consistency (25): active-day ratio + longest streak.
 * Impact (30): log-scaled stars + followers.
 * Diversity (15): language breadth + public repository count.
 *
 * Log scaling keeps a prolific maintainer from making a normal contributor's
 * score look like zero, while still rewarding genuinely large footprints.
 */
export function calculateScore(input: ScoreInput): DeveloperScore {
  const { stats, languages } = input;

  const activitySignals =
    stats.commits +
    stats.pullRequests * 2 +
    stats.issues * 1.5 +
    stats.reviews * 0.5;
  const activity = Math.round(30 * logScore(activitySignals, 2_500));

  const activeDayRatio = clamp(stats.activeDays / 365, 0, 1);
  const streakRatio = clamp(stats.longestStreak / 60, 0, 1);
  const consistency = Math.round(
    clamp(activeDayRatio * 15 + streakRatio * 10, 0, 25),
  );

  const starRatio = logScore(stats.stars, 50_000);
  const followerRatio = logScore(stats.followers, 25_000);
  const impact = Math.round(clamp(starRatio * 20 + followerRatio * 10, 0, 30));

  const languageRatio = clamp(languages.length / 6, 0, 1);
  const repoRatio = clamp(stats.publicRepos / 25, 0, 1);
  const diversity = Math.round(clamp(languageRatio * 9 + repoRatio * 6, 0, 15));

  const categories: ScoreCategory[] = [
    {
      key: "activity",
      label: "Activity",
      score: activity,
      max: 30,
      detail: `${stats.commits.toLocaleString()} commits · ${stats.pullRequests.toLocaleString()} PRs · ${stats.issues.toLocaleString()} issues`,
      explanation:
        "Log-scaled volume of commits, pull requests, issues, and reviews from the last 12 months.",
    },
    {
      key: "consistency",
      label: "Consistency",
      score: consistency,
      max: 25,
      detail: `${stats.activeDays} active days · ${stats.longestStreak}-day best streak`,
      explanation:
        "How often you show up (active days out of 365) plus a bonus for your longest contribution streak.",
    },
    {
      key: "impact",
      label: "Impact",
      score: impact,
      max: 30,
      detail: `${formatCompact(stats.stars)} stars · ${formatCompact(stats.followers)} followers`,
      explanation:
        "Log-scaled stars across your owned repositories and followers earned on GitHub.",
    },
    {
      key: "diversity",
      label: "Diversity",
      score: diversity,
      max: 15,
      detail: `${languages.length} languages · ${stats.publicRepos} public repos`,
      explanation:
        "Breadth of languages in your repositories plus the size of your public repository portfolio.",
    },
  ];

  const total = categories.reduce((sum, category) => sum + category.score, 0);
  const grade: DeveloperScore["grade"] =
    total >= 90
      ? "S"
      : total >= 80
        ? "A"
        : total >= 70
          ? "B"
          : total >= 60
            ? "C"
            : total >= 50
              ? "D"
              : "E";

  const gradeLabels: Record<DeveloperScore["grade"], string> = {
    S: "Elite",
    A: "Excellent",
    B: "Strong",
    C: "Solid",
    D: "Emerging",
    E: "Getting started",
  };

  const strongest = [...categories].sort((a, b) => b.score / b.max - a.score / a.max)[0];
  const weakest = [...categories].sort((a, b) => a.score / a.max - b.score / b.max)[0];

  return {
    total,
    grade,
    label: gradeLabels[grade],
    summary: `Strongest in ${strongest.label.toLowerCase()}, with room to grow in ${weakest.label.toLowerCase()}.`,
    categories,
  };
}
