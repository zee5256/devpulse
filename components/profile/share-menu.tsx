"use client";

import { Download, ExternalLink, Link2, Share2 } from "lucide-react";
import { toast } from "sonner";

import { XIcon } from "@/components/ui/brand-icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { siteConfig } from "@/lib/constants";

export function ShareMenu({ username }: { username: string }) {
  const profileUrl = `${siteConfig.url}/u/${username}`;
  const cardUrl = `/api/card/${username}`;
  const tweet = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `My DevPulse developer profile`,
  )}&url=${encodeURIComponent(profileUrl)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(profileUrl);
      toast.success("Profile link copied.");
    } catch {
      toast.error("Could not copy the link. You can copy it from the address bar.");
    }
  }

  function download() {
    const anchor = document.createElement("a");
    anchor.href = `${cardUrl}?download=1`;
    anchor.download = `devpulse-${username}.png`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    toast.success("Preparing your profile card…");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Share2 aria-hidden />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={copy}>
          <Link2 />
          Copy profile link
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={download}>
          <Download />
          Download score card
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            window.open(cardUrl, "_blank", "noopener,noreferrer");
          }}
        >
          <ExternalLink />
          Open card image
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            window.open(tweet, "_blank", "noopener,noreferrer");
          }}
        >
          <XIcon />
          Share on X
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
