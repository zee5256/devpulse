import { cache } from "react";
import { after } from "next/server";
import { Prisma } from "@prisma/client";

import { PROFILE_CACHE_TTL_MS, PROFILE_CACHE_TTL_SECONDS } from "@/lib/constants";
import { fetchGithubProfile } from "@/lib/github/client";
import type { ProfileData } from "@/lib/github/normalize";
import { calculateScore, type DeveloperScore } from "@/lib/score/calculate";
import { prisma } from "@/lib/prisma";
import { getRedis } from "@/lib/redis";
import {
  enforceRateLimit,
  getClientIp,
} from "@/lib/rate-limit";
import { usernameSchema } from "@/lib/validations";

export type ProfileSource = "cache" | "live" | "stale";

export type ProfileResult = {
  data: ProfileData;
  score: DeveloperScore;
  fetchedAt: string;
  stale: boolean;
  source: ProfileSource;
  warning?: string;
  cacheAgeMs: number;
};

type CachePayload = {
  data: ProfileData;
  fetchedAt: string;
};

function cacheKey(username: string): string {
  return `devpulse:profile:${username}`;
}

function isProfileData(value: unknown): value is ProfileData {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ProfileData>;
  return Boolean(
    candidate.user &&
      typeof candidate.user.login === "string" &&
      candidate.stats &&
      Array.isArray(candidate.contributions) &&
      Array.isArray(candidate.languages) &&
      Array.isArray(candidate.topRepos),
  );
}

async function readRedis(username: string): Promise<CachePayload | null> {
  const redis = getRedis();
  if (!redis) return null;
  try {
    const payload = await redis.get<CachePayload>(cacheKey(username));
    if (!payload || !isProfileData(payload.data)) return null;
    return payload;
  } catch (error) {
    console.error("Redis cache read failed.", error);
    return null;
  }
}

async function writeRedis(username: string, payload: CachePayload) {
  const redis = getRedis();
  if (!redis) return;
  try {
    await redis.set(cacheKey(username), payload, {
      ex: PROFILE_CACHE_TTL_SECONDS,
    });
  } catch (error) {
    console.error("Redis cache write failed.", error);
  }
}

function toResult(
  payload: CachePayload,
  source: ProfileSource,
  warning?: string,
): ProfileResult {
  const age = Math.max(0, Date.now() - new Date(payload.fetchedAt).getTime());
  return {
    data: payload.data,
    score: calculateScore(payload.data),
    fetchedAt: payload.fetchedAt,
    stale: source === "stale",
    source,
    warning,
    cacheAgeMs: age,
  };
}

async function readDatabase(
  username: string,
): Promise<CachePayload & { stale: boolean } | null> {
  const row = await prisma.profileSnapshot.findUnique({
    where: { username },
  });
  if (!row || !isProfileData(row.data)) return null;

  return {
    data: row.data,
    fetchedAt: row.fetchedAt.toISOString(),
    stale: Date.now() - row.fetchedAt.getTime() > PROFILE_CACHE_TTL_MS,
  };
}

/**
 * Refreshes a profile from GitHub and writes both cache layers. This is used
 * directly by the seed script and by stale-while-revalidate.
 */
export async function refreshProfile(username: string): Promise<ProfileResult> {
  const data = await fetchGithubProfile(username);
  const score = calculateScore(data);
  const fetchedAt = new Date();
  const payload: CachePayload = { data, fetchedAt: fetchedAt.toISOString() };

  await prisma.profileSnapshot.upsert({
    where: { username },
    create: {
      username,
      data: data as unknown as Prisma.InputJsonValue,
      score: score.total,
      fetchedAt,
    },
    update: {
      data: data as unknown as Prisma.InputJsonValue,
      score: score.total,
      fetchedAt,
    },
  });

  await writeRedis(username, payload);
  return toResult(payload, "live");
}

function scheduleRefresh(username: string) {
  const task = refreshProfile(username).catch((error) => {
    console.error(`Background refresh failed for ${username}.`, error);
  });

  try {
    after(task);
  } catch {
    // Outside a Next.js request scope (for example a script), just let it run.
    void task;
  }
}

/**
 * Fresh for 3 hours, then stale-while-revalidate: the stale snapshot is
 * returned immediately and a background refresh updates both cache layers.
 */
export async function getProfile(
  username: string,
  options: { ip?: string; allowStale?: boolean } = {},
): Promise<ProfileResult> {
  const parsed = usernameSchema.safeParse(username);
  if (!parsed.success) {
    const { GithubError } = await import("@/lib/github/errors");
    throw new GithubError("NOT_FOUND", "Invalid GitHub username.");
  }
  const normalized = parsed.data;

  const redisPayload = await readRedis(normalized);
  if (redisPayload) {
    const age = Date.now() - new Date(redisPayload.fetchedAt).getTime();
    if (age <= PROFILE_CACHE_TTL_MS) {
      return toResult(redisPayload, "cache");
    }
  }

  const databasePayload = await readDatabase(normalized);
  if (databasePayload) {
    if (!databasePayload.stale) {
      await writeRedis(normalized, databasePayload);
      return toResult(databasePayload, "cache");
    }

    if (options.allowStale !== false) {
      scheduleRefresh(normalized);
      return toResult(
        databasePayload,
        "stale",
        "Showing a cached snapshot while DevPulse refreshes this profile in the background.",
      );
    }
  }

  const ip = options.ip ?? (await getClientIp());
  await enforceRateLimit(ip, "profile");

  const fresh = await refreshProfile(normalized);
  return fresh;
}

/**
 * React `cache` deduplicates the profile fetch between `generateMetadata` and
 * the page render for the same request.
 */
export const getProfileForPage = cache((username: string) =>
  getProfile(username),
);

export async function getProfileForScript(username: string): Promise<ProfileResult> {
  const parsed = usernameSchema.parse(username);
  const databasePayload = await readDatabase(parsed);
  if (databasePayload) {
    return toResult(databasePayload, databasePayload.stale ? "stale" : "cache");
  }
  return refreshProfile(parsed);
}
