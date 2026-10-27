import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthAside } from "@/components/auth/auth-aside";
import { LoginForm } from "@/components/auth/login-form";
import { auth, githubEnabled } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to DevPulse to save favorite developers and build a private dashboard from public GitHub profiles.",
};

function authErrorMessage(code?: string): string | undefined {
  if (!code) return undefined;
  if (code === "OAuthAccountNotLinked") {
    return "That email is already registered with a password. Sign in with your email and password instead.";
  }
  if (code === "AccessDenied") {
    return "GitHub sign-in was cancelled.";
  }
  return "Sign-in could not be completed. Please try again.";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    callbackUrl?: string;
    registered?: string;
    error?: string;
  }>;
}) {
  let session = null;
  try {
    session = await auth();
  } catch {
    session = null;
  }

  const { callbackUrl, registered, error } = await searchParams;
  const safeCallback =
    callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/dashboard";

  if (session?.user) redirect(safeCallback);

  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
      <AuthAside mode="login" />

      <div className="flex flex-col justify-center">
        <div className="mb-5 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            Back to DevPulse
          </Link>
          <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Secure sign-in
          </span>
        </div>
        <LoginForm
          githubEnabled={githubEnabled}
          callbackUrl={safeCallback}
          registered={registered === "1"}
          authError={authErrorMessage(error)}
        />
        <p className="mt-5 text-center text-[11px] leading-relaxed text-muted-foreground">
          By continuing, you agree to keep your credentials secure. DevPulse
          stores only your name, email, optional GitHub username, avatar URL, and
          saved profiles.
        </p>
      </div>
    </div>
  );
}
