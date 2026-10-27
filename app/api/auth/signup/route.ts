import { Prisma } from "@prisma/client";

import { jsonData, jsonError, readJson } from "@/lib/api";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { signupSchema } from "@/lib/validations";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const ip = await getClientIp();
    const limit = await checkRateLimit(ip, "signup");
    if (!limit.success) {
      return jsonError(
        "Too many sign-up attempts. Please try again in a few minutes.",
        429,
        "RATE_LIMITED",
      );
    }
  } catch {
    // The limiter is best-effort; a database outage should not block signup.
  }

  const parsed = signupSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return jsonError(
      parsed.error.issues[0]?.message ?? "Check the form and try again.",
      400,
      "INVALID_INPUT",
    );
  }

  const { name, email, password, githubUsername } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { email: { equals: email, mode: "insensitive" } },
        ...(githubUsername ? [{ githubUsername }] : []),
      ],
    },
    select: { email: true, githubUsername: true },
  });

  if (existing) {
    const emailTaken = existing.email?.toLowerCase() === email;
    return jsonError(
      emailTaken
        ? "An account with that email already exists. Sign in instead."
        : "That GitHub username is already linked to another account.",
      409,
      emailTaken ? "EMAIL_TAKEN" : "USERNAME_TAKEN",
    );
  }

  try {
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, githubUsername },
      select: { id: true, name: true, email: true },
    });

    return jsonData({ user }, 201);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const target = Array.isArray(error.meta?.target)
        ? error.meta.target.join(",")
        : String(error.meta?.target ?? "");
      return jsonError(
        target.includes("githubUsername")
          ? "That GitHub username is already linked to another account."
          : "An account with that email already exists. Sign in instead.",
        409,
        "ACCOUNT_EXISTS",
      );
    }

    console.error("Signup failed:", error);
    return jsonError(
      "Could not create your account. Please try again.",
      500,
      "SIGNUP_FAILED",
    );
  }
}
