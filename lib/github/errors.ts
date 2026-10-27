export type GithubErrorCode =
  | "NOT_FOUND"
  | "RATE_LIMIT"
  | "AUTH"
  | "CONFIG"
  | "NETWORK"
  | "INVALID_RESPONSE"
  | "UNKNOWN";

export class GithubError extends Error {
  code: GithubErrorCode;
  status?: number;
  resetAt?: Date;
  retryAfterSeconds?: number;

  constructor(
    code: GithubErrorCode,
    message: string,
    options: {
      status?: number;
      resetAt?: Date;
      retryAfterSeconds?: number;
      cause?: unknown;
    } = {},
  ) {
    super(message, { cause: options.cause });
    this.name = "GithubError";
    this.code = code;
    this.status = options.status;
    this.resetAt = options.resetAt;
    this.retryAfterSeconds = options.retryAfterSeconds;
  }
}

export function isGithubError(error: unknown): error is GithubError {
  return error instanceof GithubError;
}

export function githubErrorMessage(error: unknown): {
  title: string;
  message: string;
  canRetry: boolean;
} {
  if (isGithubError(error)) {
    switch (error.code) {
      case "NOT_FOUND":
        return {
          title: "Developer not found",
          message:
            "We could not find that GitHub username. Check the spelling and try again.",
          canRetry: false,
        };
      case "RATE_LIMIT":
        return {
          title: "GitHub is taking a breather",
          message: error.resetAt
            ? `The GitHub API rate limit was reached. It resets ${error.resetAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}. Please try again after that.`
            : "The GitHub API rate limit was reached. Please try again in a few minutes.",
          canRetry: true,
        };
      case "AUTH":
        return {
          title: "GitHub authentication failed",
          message:
            "The server's GitHub token is missing or invalid. Add a valid GITHUB_TOKEN and try again.",
          canRetry: false,
        };
      case "CONFIG":
        return {
          title: "GitHub is not configured",
          message:
            "Add a server-side GITHUB_TOKEN to .env.local (or the deployment environment) to load live profiles.",
          canRetry: false,
        };
      case "NETWORK":
        return {
          title: "Could not reach GitHub",
          message:
            "GitHub did not respond in time. Please try again in a moment.",
          canRetry: true,
        };
      default:
        return {
          title: "Something went wrong",
          message:
            "We could not load this profile from GitHub. Please try again.",
          canRetry: true,
        };
    }
  }

  return {
    title: "Something went wrong",
    message: "An unexpected error occurred. Please try again.",
    canRetry: true,
  };
}
