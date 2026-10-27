"use client";

import { LockKeyhole } from "lucide-react";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";

import { GithubIcon } from "@/components/ui/brand-icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function LoginForm({
  githubEnabled,
  callbackUrl,
}: {
  githubEnabled: boolean;
  callbackUrl: string;
}) {
  const [loading, setLoading] = useState(false);

  if (!githubEnabled) {
    return (
      <Card className="p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-accent-soft text-accent">
            <GithubIcon className="size-5" aria-hidden />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold">GitHub sign-in</h2>
            <p className="text-xs text-muted-foreground">Almost there</p>
          </div>
        </div>
        <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
          GitHub OAuth is not configured on this deployment yet. The public
          dashboards, compare mode, and share cards work without an account.
        </p>
        <div className="mt-5 rounded-xl border border-border bg-muted/40 p-4 text-xs leading-relaxed">
          <p className="font-semibold">To enable favorites and My Dashboard:</p>
          <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-muted-foreground">
            <li>
              Create a GitHub OAuth app at{" "}
              <a
                href="https://github.com/settings/developers"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-accent underline-offset-4 hover:underline"
              >
                github.com/settings/developers
              </a>
              .
            </li>
            <li>
              Set the callback URL to{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-[10px]">
                /api/auth/callback/github
              </code>
              .
            </li>
            <li>
              Add{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-[10px]">
                AUTH_GITHUB_ID
              </code>{" "}
              and{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-[10px]">
                AUTH_GITHUB_SECRET
              </code>{" "}
              to the environment.
            </li>
          </ol>
        </div>
        <Button variant="secondary" className="mt-5 w-full" onClick={() => window.history.back()}>
          Go back
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-xl bg-accent-soft text-accent">
          <GithubIcon className="size-5" aria-hidden />
        </span>
        <div>
          <h2 className="font-display text-lg font-semibold">Welcome back</h2>
          <p className="text-xs text-muted-foreground">One click, no passwords</p>
        </div>
      </div>
      <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
        Sign in to save favorite developers and build a private dashboard from
        public GitHub profiles. We never post, follow, or change anything on your
        account.
      </p>
      <Button
        size="lg"
        className="mt-6 w-full"
        loading={loading}
        onClick={async () => {
          setLoading(true);
          try {
            await signIn("github", { redirectTo: callbackUrl });
          } catch {
            setLoading(false);
            toast.error("GitHub sign-in could not start. Please try again.");
          }
        }}
      >
        <GithubIcon aria-hidden />
        Continue with GitHub
      </Button>
      <div className="mt-5 flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
        <LockKeyhole className="size-3" aria-hidden />
        Public profile + email only. No repo write access.
      </div>
    </Card>
  );
}

