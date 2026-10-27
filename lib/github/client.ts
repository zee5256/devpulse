import { PROFILE_QUERY } from "./query";
import { githubResponseSchema, type GithubUser } from "./schemas";
import { GithubError } from "./errors";
import { normalizeGithubUser, type ProfileData } from "./normalize";
import type { z } from "zod";

type GithubErrorPayload = {
  message?: string;
  type?: string;
  errors?: Array<{ message?: string; type?: string }>;
};

function readResetAt(headers: Headers): Date | undefined {
  const reset = headers.get("x-ratelimit-reset");
  if (!reset) return undefined;
  const seconds = Number(reset);
  if (!Number.isFinite(seconds)) return undefined;
  return new Date(seconds * 1000);
}

function readRetryAfter(headers: Headers): number | undefined {
  const retryAfter = headers.get("retry-after");
  if (!retryAfter) return undefined;
  const seconds = Number(retryAfter);
  return Number.isFinite(seconds) ? seconds : undefined;
}

function isRateLimitMessage(message: string | undefined): boolean {
  if (!message) return false;
  return /rate limit|abuse detection|secondary rate/i.test(message);
}

export async function fetchGithubUser(
  login: string,
  options: {
    token?: string;
    from?: Date;
    to?: Date;
    fetchImpl?: typeof fetch;
  } = {},
): Promise<GithubUser> {
  const token = options.token ?? process.env.GITHUB_TOKEN;
  if (!token) {
    throw new GithubError(
      "CONFIG",
      "GITHUB_TOKEN is not configured on the server.",
    );
  }

  const now = new Date();
  const to = options.to ?? now;
  const from =
    options.from ?? new Date(to.getTime() - 365 * 24 * 60 * 60 * 1000);
  const fetchImpl = options.fetchImpl ?? fetch;

  let response: Response;
  try {
    response = await fetchImpl("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.github+json",
        "User-Agent": "DevPulse/1.0",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({
        query: PROFILE_QUERY,
        variables: {
          login,
          from: from.toISOString(),
          to: to.toISOString(),
        },
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch (error) {
    throw new GithubError(
      "NETWORK",
      "The request to GitHub timed out or could not be completed.",
      { cause: error },
    );
  }

  const resetAt = readResetAt(response.headers);
  const retryAfterSeconds = readRetryAfter(response.headers);

  if (!response.ok) {
    let payload: GithubErrorPayload | null = null;
    try {
      payload = (await response.json()) as GithubErrorPayload;
    } catch {
      // Ignore malformed error bodies.
    }

    if (response.status === 401) {
      throw new GithubError("AUTH", "GitHub rejected the server token.", {
        status: response.status,
        cause: payload,
      });
    }

    if (
      response.status === 403 ||
      response.status === 429 ||
      response.headers.get("x-ratelimit-remaining") === "0" ||
      isRateLimitMessage(payload?.message)
    ) {
      throw new GithubError("RATE_LIMIT", "GitHub API rate limit reached.", {
        status: response.status,
        resetAt,
        retryAfterSeconds,
        cause: payload,
      });
    }

    throw new GithubError(
      "UNKNOWN",
      `GitHub returned HTTP ${response.status}.`,
      { status: response.status, cause: payload },
    );
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch (error) {
    throw new GithubError(
      "INVALID_RESPONSE",
      "GitHub returned an unreadable response.",
      { cause: error },
    );
  }

  const parsed = githubResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw new GithubError(
      "INVALID_RESPONSE",
      "GitHub returned data in an unexpected shape.",
      { cause: parsed.error },
    );
  }

  const errors = parsed.data.errors ?? [];
  if (errors.length > 0) {
    const rateLimited = errors.some(
      (error) =>
        error.type === "RATE_LIMITED" || isRateLimitMessage(error.message),
    );
    if (rateLimited) {
      throw new GithubError("RATE_LIMIT", "GitHub API rate limit reached.", {
        resetAt,
        retryAfterSeconds,
      });
    }

    if (
      errors.some((error) =>
        /bad credentials|requires authentication/i.test(error.message),
      )
    ) {
      throw new GithubError("AUTH", "GitHub rejected the server token.");
    }

    if (!parsed.data.data?.user) {
      const notFound = errors.some((error) =>
        /could not resolve to a user|not found/i.test(error.message),
      );
      throw new GithubError(
        notFound ? "NOT_FOUND" : "UNKNOWN",
        notFound
          ? "That GitHub user does not exist."
          : errors[0]?.message ?? "GitHub returned an error.",
        { cause: errors },
      );
    }
  }

  if (!parsed.data.data?.user) {
    throw new GithubError(
      "NOT_FOUND",
      "That GitHub user does not exist.",
    );
  }

  return parsed.data.data.user;
}

export async function fetchGithubProfile(
  login: string,
  options: {
    token?: string;
    from?: Date;
    to?: Date;
    fetchImpl?: typeof fetch;
    now?: Date;
  } = {},
): Promise<ProfileData> {
  const now = options.now ?? new Date();
  const to = options.to ?? now;
  const from =
    options.from ?? new Date(to.getTime() - 365 * 24 * 60 * 60 * 1000);
  const user = await fetchGithubUser(login, {
    ...options,
    from,
    to,
  });
  return normalizeGithubUser(user, { from, to, now });
}

export type GithubUserResult = z.infer<typeof githubResponseSchema>;
