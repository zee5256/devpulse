import { Ratelimit } from "@upstash/ratelimit";
import { headers } from "next/headers";

import { prisma } from "@/lib/prisma";
import { getRedis } from "@/lib/redis";

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

export class RateLimitExceededError extends Error {
  retryAfterSeconds: number;

  constructor(retryAfterSeconds: number) {
    super("Too many requests. Please try again later.");
    this.name = "RateLimitExceededError";
    this.retryAfterSeconds = Math.max(1, retryAfterSeconds);
  }
}

export function isRateLimitExceeded(
  error: unknown,
): error is RateLimitExceededError {
  return error instanceof RateLimitExceededError;
}

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 40;

let upstashLimiter: Ratelimit | null | undefined;

function getUpstashLimiter(): Ratelimit | null {
  if (upstashLimiter !== undefined) return upstashLimiter;
  const redis = getRedis();
  if (!redis) {
    upstashLimiter = null;
    return upstashLimiter;
  }

  upstashLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(MAX_REQUESTS, "10 m"),
    analytics: true,
    prefix: "devpulse:ratelimit",
  });
  return upstashLimiter;
}

async function postgresRateLimit(key: string): Promise<RateLimitResult> {
  const resetAt = new Date(Date.now() + WINDOW_MS);
  const rows = await prisma.$queryRaw<
    Array<{ count: number; resetAt: Date }>
  >`
    INSERT INTO "RateLimit" ("key", "count", "resetAt")
    VALUES (${key}, 1, ${resetAt})
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE
        WHEN "RateLimit"."resetAt" <= NOW() THEN 1
        ELSE "RateLimit"."count" + 1
      END,
      "resetAt" = CASE
        WHEN "RateLimit"."resetAt" <= NOW() THEN ${resetAt}
        ELSE "RateLimit"."resetAt"
      END
    RETURNING "count", "resetAt"
  `;

  const row = rows[0];
  const count = row?.count ?? 1;
  const reset = row?.resetAt?.getTime() ?? resetAt.getTime();
  return {
    success: count <= MAX_REQUESTS,
    limit: MAX_REQUESTS,
    remaining: Math.max(0, MAX_REQUESTS - count),
    reset,
  };
}

/**
 * Checks a per-IP bucket. Cached profile reads never reach this function, so
 * normal browsing does not burn the GitHub API budget.
 */
export async function checkRateLimit(
  identifier: string,
  bucket = "profile",
): Promise<RateLimitResult> {
  const key = `${bucket}:${identifier}`;
  const limiter = getUpstashLimiter();

  if (limiter) {
    try {
      const result = await limiter.limit(key);
      return {
        success: result.success,
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset,
      };
    } catch (error) {
      console.error("Upstash rate limit failed; falling back to Postgres.", error);
    }
  }

  try {
    return await postgresRateLimit(key);
  } catch (error) {
    // Fail open. A cache miss is still more useful than a broken page.
    console.error("Postgres rate limit failed; allowing request.", error);
    return {
      success: true,
      limit: MAX_REQUESTS,
      remaining: MAX_REQUESTS,
      reset: Date.now() + WINDOW_MS,
    };
  }
}

export async function enforceRateLimit(
  identifier: string,
  bucket = "profile",
): Promise<void> {
  const result = await checkRateLimit(identifier, bucket);
  if (!result.success) {
    throw new RateLimitExceededError(
      Math.ceil((result.reset - Date.now()) / 1000),
    );
  }
}

/** Best-effort client IP for per-IP limits behind Vercel. */
export async function getClientIp(): Promise<string> {
  const requestHeaders = await headers();
  const forwarded = requestHeaders.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return (
    requestHeaders.get("x-real-ip") ??
    requestHeaders.get("cf-connecting-ip") ??
    "127.0.0.1"
  );
}
