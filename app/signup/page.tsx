import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthAside } from "@/components/auth/auth-aside";
import { SignupForm } from "@/components/auth/signup-form";
import { auth, githubEnabled } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Create account",
  description:
    "Create a free DevPulse account to save favorite developers and build a private dashboard from public GitHub profiles.",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  let session = null;
  try {
    session = await auth();
  } catch {
    session = null;
  }

  const { callbackUrl } = await searchParams;
  const safeCallback =
    callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/dashboard";

  if (session?.user) redirect(safeCallback);

  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
      <AuthAside mode="signup" />

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
            Free account
          </span>
        </div>
        <SignupForm githubEnabled={githubEnabled} callbackUrl={safeCallback} />
        <p className="mt-5 text-center text-[11px] leading-relaxed text-muted-foreground">
          Public GitHub analytics stay free without an account. Your DevPulse
          account only stores your profile details and saved developers.
        </p>
      </div>
    </div>
  );
}
