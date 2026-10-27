import { Heart } from "lucide-react";
import Link from "next/link";

import { GithubIcon } from "@/components/ui/brand-icons";
import { Logo } from "@/components/ui/logo";
import { DEMO_USERS } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border/70 bg-surface/50">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            A clearer view of your open-source footprint. Built with Next.js,
            GitHub&apos;s GraphQL API, and a deliberately transparent Developer
            Score.
          </p>
          <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            Built with <Heart className="size-3.5 fill-accent text-accent" aria-hidden /> by{" "}
            <a
              href="https://github.com/zee5256"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Muhammad Zia Dilawar
            </a>
          </p>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Explore
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link href="/compare" className="text-muted-foreground hover:text-foreground">
                Compare developers
              </Link>
            </li>
            <li>
              <Link href="/#score" className="text-muted-foreground hover:text-foreground">
                How the score works
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
                My dashboard
              </Link>
            </li>
            <li>
              <a
                href="https://github.com/zee5256/devpulse"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <GithubIcon className="size-3.5" aria-hidden />
                Source code
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Demo profiles
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {DEMO_USERS.slice(0, 4).map((username) => (
              <li key={username}>
                <Link
                  href={`/u/${username}`}
                  className="font-mono text-xs text-muted-foreground hover:text-accent"
                >
                  @{username}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-border/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} DevPulse. Data belongs to its creators.</p>
          <p>
            Not affiliated with GitHub. Profiles are cached for 3 hours and refreshed
            in the background.
          </p>
        </div>
      </div>
    </footer>
  );
}
