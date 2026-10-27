"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <span className="mb-5 grid size-12 place-items-center rounded-2xl bg-danger/10 text-danger">
        <AlertTriangle className="size-6" aria-hidden />
      </span>
      <h1 className="font-display text-3xl font-bold">Something went sideways</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        DevPulse hit an unexpected error while rendering this page. Your data is
        safe — try again, or head back home.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>
          <RotateCcw className="size-4" aria-hidden />
          Try again
        </Button>
        <Button variant="secondary" asChild>
          <Link href="/">Back home</Link>
        </Button>
      </div>
    </div>
  );
}
