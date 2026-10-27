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

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Enter your email address.")
  .max(254, "That email address is too long.")
  .email("Enter a valid email address.")
  .transform((value) => value.toLowerCase());

export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(128, "Passwords are at most 128 characters.");

export const optionalUsernameSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => {
    if (!value) return undefined;
    return value.replace(/^@+/, "").toLowerCase();
  })
  .refine((value) => value === undefined || usernamePattern.test(value), {
    message: "That does not look like a valid GitHub username.",
  });

export const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter your name.")
    .max(80, "Names are at most 80 characters."),
  email: emailSchema,
  password: passwordSchema,
  githubUsername: optionalUsernameSchema,
});

export const credentialsSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, "Enter your password.")
    .max(128, "Passwords are at most 128 characters."),
});

export type SearchInput = z.input<typeof searchSchema>;
export type CompareInput = z.input<typeof compareSchema>;
export type SignupInput = z.input<typeof signupSchema>;
