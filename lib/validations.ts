import { z } from "zod";

/**
 * GitHub usernames: 1–39 characters, letters/numbers/single hyphens, and they
 * cannot start or end with a hyphen. We normalize to lower case so cache keys
 * are stable (GitHub treats logins case-insensitively).
 */
export const usernamePattern =
  /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;

export const usernameSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/^@+/, ""))
  .pipe(
    z
      .string()
      .min(1, "Enter a GitHub username.")
      .max(39, "GitHub usernames are at most 39 characters.")
      .regex(usernamePattern, "That does not look like a valid GitHub username."),
  )
  .transform((value) => value.toLowerCase());

export const searchSchema = z.object({
  username: usernameSchema,
});

export const compareSchema = z.object({
  a: usernameSchema,
  b: usernameSchema,
});

export const favoriteSchema = z.object({
  username: usernameSchema,
});

export type SearchInput = z.input<typeof searchSchema>;
export type CompareInput = z.input<typeof compareSchema>;
