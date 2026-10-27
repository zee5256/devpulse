export const siteConfig = {
  name: "DevPulse",
  tagline: "Your GitHub footprint, in focus.",
  description:
    "A fast, privacy-friendly GitHub analytics dashboard. Explore contribution activity, language mix, top repositories, and a transparent Developer Score.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  github: "https://github.com/zee5256/devpulse",
  author: "Muhammad Zia Dilawar",
} as const;

export const PROFILE_CACHE_TTL_MS = 3 * 60 * 60 * 1000;
export const PROFILE_CACHE_TTL_SECONDS = PROFILE_CACHE_TTL_MS / 1000;
export const STALE_WHILE_REVALIDATE_MS = 24 * 60 * 60 * 1000;

export const DEMO_USERS = [
  "torvalds",
  "sindresorhus",
  "gaearon",
  "cassidoo",
] as const;

export const DEFAULT_TOP_REPOS = 6;

export const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

export function isGithubAuthConfigured(): boolean {
  return Boolean(
    process.env.AUTH_GITHUB_ID?.trim() &&
      process.env.AUTH_GITHUB_SECRET?.trim(),
  );
}

export const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;
