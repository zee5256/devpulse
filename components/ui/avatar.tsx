"use client";

import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "@/lib/utils";
import { initials } from "@/lib/utils";

export function Avatar({
  src,
  alt,
  name,
  login,
  className,
  fallbackClassName,
}: {
  src?: string | null;
  alt: string;
  name?: string | null;
  login: string;
  className?: string;
  fallbackClassName?: string;
}) {
  return (
    <AvatarPrimitive.Root
      className={cn(
        "relative flex size-10 shrink-0 overflow-hidden rounded-full border border-border bg-muted",
        className,
      )}
    >
      {src ? (
        <AvatarPrimitive.Image
          src={src}
          alt={alt}
          className="size-full object-cover"
        />
      ) : null}
      <AvatarPrimitive.Fallback
        className={cn(
          "grid size-full place-items-center bg-accent-soft text-xs font-bold text-accent",
          fallbackClassName,
        )}
        delayMs={src ? 400 : 0}
      >
        {initials(name, login)}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}
