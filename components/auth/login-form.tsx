"use client";

import { Eye, EyeOff, LockKeyhole } from "lucide-react";
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

export function LoginForm({
  githubEnabled,
  callbackUrl,
  registered = false,
  authError,
}: {
  githubEnabled: boolean;
  callbackUrl: string;
  registered?: boolean;
  authError?: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [provider, setProvider] = useState<Provider>(null);
  const [error, setError] = useState<string | null>(authError ?? null);
  const [notice, setNotice] = useState<string | null>(
    registered ? "Account created. Sign in with your new credentials." : null,
  );

  const signupHref = `/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProvider("credentials");
    setError(null);
    setNotice(null);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result || result.error) {
        throw new Error("Incorrect email or password. Please try again.");
      }

      toast.success("Signed in.");
      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not sign in. Please try again.";
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
      setError("GitHub sign-in could not start. Please try again.");
      toast.error("GitHub sign-in could not start. Please try again.");
    }
  }

  return (
    <Card className="p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-xl bg-accent-soft text-accent">
          <LockKeyhole className="size-5" aria-hidden />
        </span>
        <div>
          <h2 className="font-display text-lg font-semibold">Welcome back</h2>
          <p className="text-xs text-muted-foreground">
            Sign in with your DevPulse account
          </p>
        </div>
      </div>

      {notice ? (
        <p
          role="status"
          className="mt-5 rounded-xl border border-accent/20 bg-accent-soft/60 px-3.5 py-2.5 text-xs leading-relaxed text-accent"
        >
          {notice}
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
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
            aria-describedby={error ? "auth-error" : undefined}
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
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your password"
              className="pr-11"
              aria-describedby={error ? "auth-error" : undefined}
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
        </div>

        {error ? (
          <p
            id="auth-error"
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
          Sign in
        </Button>
      </form>

      <p className="mt-5 text-center text-xs text-muted-foreground">
        New to DevPulse?{" "}
        <Link
          href={signupHref}
          className="font-semibold text-accent underline-offset-4 hover:underline"
        >
          Create an account
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

      <div className="mt-5 flex items-center justify-center gap-2 text-center text-[10px] text-muted-foreground">
        <LockKeyhole className="size-3 shrink-0" aria-hidden />
        Passwords are hashed with scrypt. No repo write access.
      </div>
    </Card>
  );
}
