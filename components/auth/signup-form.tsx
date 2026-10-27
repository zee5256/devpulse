"use client";

import { Eye, EyeOff, UserPlus } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { GithubIcon } from "@/components/ui/brand-icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Provider = "credentials" | "github" | null;

type ApiPayload = {
  data?: { user?: { id: string; email: string | null } };
  error?: { message?: string };
};

export function SignupForm({
  githubEnabled,
  callbackUrl,
}: {
  githubEnabled: boolean;
  callbackUrl: string;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [githubUsername, setGithubUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [provider, setProvider] = useState<Provider>(null);
  const [error, setError] = useState<string | null>(null);

  const loginHref = `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProvider("credentials");
    setError(null);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          githubUsername: githubUsername.trim() || undefined,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | ApiPayload
        | null;

      if (!response.ok) {
        throw new Error(
          payload?.error?.message ?? "Could not create your account.",
        );
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result || result.error) {
        toast.success("Account created. Please sign in.");
        router.push(`${loginHref}&registered=1`);
        return;
      }

      toast.success("Account created. Welcome to DevPulse!");
      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Could not create your account. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setProvider(null);
    }
  }

  async function handleGithub() {
    setProvider("github");
    setError(null);
    try {
      await signIn("github", { redirectTo: callbackUrl });
    } catch {
      setProvider(null);
      setError("GitHub sign-up could not start. Please try again.");
      toast.error("GitHub sign-up could not start. Please try again.");
    }
  }

  return (
    <Card className="p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-xl bg-accent-soft text-accent">
          <UserPlus className="size-5" aria-hidden />
        </span>
        <div>
          <h2 className="font-display text-lg font-semibold">Create your account</h2>
          <p className="text-xs text-muted-foreground">
            Free, private by default, and ready in seconds
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <div>
          <label
            htmlFor="name"
            className="mb-1.5 block text-xs font-semibold text-foreground"
          >
            Name
          </label>
          <Input
            id="name"
            name="name"
            autoComplete="name"
            required
            minLength={2}
            maxLength={80}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-xs font-semibold text-foreground"
          >
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-xs font-semibold text-foreground"
          >
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={128}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              className="pr-11"
              aria-describedby="password-hint"
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {showPassword ? (
                <EyeOff className="size-4" aria-hidden />
              ) : (
                <Eye className="size-4" aria-hidden />
              )}
            </button>
          </div>
          <p
            id="password-hint"
            className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground"
          >
            Use at least 8 characters. A password manager works well here.
          </p>
        </div>

        <div>
          <label
            htmlFor="githubUsername"
            className="mb-1.5 block text-xs font-semibold text-foreground"
          >
            GitHub username{" "}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <Input
            id="githubUsername"
            name="githubUsername"
            autoComplete="username"
            value={githubUsername}
            onChange={(event) => setGithubUsername(event.target.value)}
            placeholder="octocat"
            aria-describedby="github-hint"
          />
          <p
            id="github-hint"
            className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground"
          >
            Links your public profile to this account. You can skip it and add
            it later with GitHub sign-in.
          </p>
        </div>

        {error ? (
          <p
            role="alert"
            className="rounded-xl border border-danger/20 bg-danger/10 px-3.5 py-2.5 text-xs leading-relaxed text-danger"
          >
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          size="lg"
          className="w-full"
          loading={provider === "credentials"}
          disabled={provider !== null}
        >
          Create account
        </Button>
      </form>

      <p className="mt-5 text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link
          href={loginHref}
          className="font-semibold text-accent underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>

      {githubEnabled ? (
        <>
          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              or
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>
          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            loading={provider === "github"}
            disabled={provider !== null}
            onClick={handleGithub}
          >
            <GithubIcon aria-hidden />
            Continue with GitHub
          </Button>
        </>
      ) : null}

      <p className="mt-5 text-center text-[10px] leading-relaxed text-muted-foreground">
        No credit card. No repo write access. Your password is stored only as a
        salted scrypt hash.
      </p>
    </Card>
  );
}
