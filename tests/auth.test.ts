import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "@/lib/password";
import { credentialsSchema, signupSchema } from "@/lib/validations";

describe("password hashing", () => {
  it("hashes with a unique salt and verifies the original password", async () => {
    const password = "correct horse battery staple";
    const first = await hashPassword(password);
    const second = await hashPassword(password);

    expect(first.startsWith("scrypt$")).toBe(true);
    expect(first).not.toContain(password);
    expect(first).not.toBe(second);
    await expect(verifyPassword(password, first)).resolves.toBe(true);
    await expect(verifyPassword("wrong password", first)).resolves.toBe(false);
  });

  it("rejects malformed or truncated hashes", async () => {
    await expect(verifyPassword("password", "not-a-hash")).resolves.toBe(false);
    await expect(verifyPassword("password", "scrypt$salt")).resolves.toBe(false);
    await expect(
      verifyPassword("password", "bcrypt$salt$hash"),
    ).resolves.toBe(false);
  });
});

describe("signupSchema", () => {
  const base = {
    name: "Ada Lovelace",
    email: " ADA@Example.COM ",
    password: "eight-chars",
  };

  it("normalizes email and GitHub username", () => {
    const parsed = signupSchema.parse({
      ...base,
      githubUsername: "@OctoCat",
    });

    expect(parsed.email).toBe("ada@example.com");
    expect(parsed.githubUsername).toBe("octocat");
  });

  it("treats an empty GitHub username as optional", () => {
    const parsed = signupSchema.parse({ ...base, githubUsername: "" });
    expect(parsed.githubUsername).toBeUndefined();
  });

  it("rejects short passwords and invalid usernames", () => {
    expect(
      signupSchema.safeParse({ ...base, password: "short" }).success,
    ).toBe(false);
    expect(
      signupSchema.safeParse({ ...base, githubUsername: "-bad-" }).success,
    ).toBe(false);
  });
});

describe("credentialsSchema", () => {
  it("normalizes the email used for sign-in", () => {
    const parsed = credentialsSchema.parse({
      email: " USER@Example.com ",
      password: "secret",
    });
    expect(parsed.email).toBe("user@example.com");
  });
});
