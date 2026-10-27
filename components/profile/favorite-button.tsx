"use client";

import { Bookmark, LoaderCircle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  username,
  initialSaved,
  isSignedIn,
}: {
  username: string;
  initialSaved: boolean;
  isSignedIn: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  async function toggle() {
    if (!isSignedIn) {
      toast.info("Sign in to save developers.");
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        saved
          ? `/api/favorites/${encodeURIComponent(username)}`
          : "/api/favorites",
        {
          method: saved ? "DELETE" : "POST",
          headers: { "Content-Type": "application/json" },
          body: saved ? undefined : JSON.stringify({ username }),
        },
      );

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null;
        throw new Error(payload?.error?.message ?? "Could not update favorites.");
      }

      setSaved(!saved);
      toast.success(
        saved ? `Removed @${username} from favorites.` : `Saved @${username}.`,
      );
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant={saved ? "secondary" : "outline"}
      onClick={toggle}
      disabled={loading}
      aria-pressed={saved}
      className={cn(saved && "border-accent/35 bg-accent-soft text-accent")}
    >
      {loading ? (
        <LoaderCircle className="animate-spin" aria-hidden />
      ) : (
        <Bookmark className={cn(saved && "fill-current")} aria-hidden />
      )}
      {saved ? "Saved" : "Save"}
    </Button>
  );
}
