import { Redis } from "@upstash/redis";

let redis: Redis | null | undefined;

/**
 * Upstash is optional. When it is not configured, the app uses Neon/Postgres
 * for both the profile cache and the rate-limit fallback.
 */
export function getRedis(): Redis | null {
  if (redis !== undefined) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) {
    redis = null;
    return redis;
  }

  redis = new Redis({ url, token });
  return redis;
}
