"use client";

import {
  ArrowUpRight,
  Bookmark,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { GithubIcon } from "@/components/ui/brand-icons";
import { Logo } from "@/components/ui/logo";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usernameSchema } from "@/lib/validations";

const NAV = [
  { href: "/#features", label: "Features" },
  { href: "/compare", label: "Compare" },
  { href: "/#score", label: "Developer Score" },
];

function HeaderSearch({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();
  const [value, setValue] = useState("");

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const parsed = usernameSchema.safeParse(value);
        if (!parsed.success) {
          toast.error(parsed.error.issues[0]?.message ?? "Enter a username.");
          return;
        }
        onNavigate?.();
        router.push(`/u/${parsed.data}`);
      }}
      className="relative"
      role="search"
    >
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search a username"
        aria-label="Search a GitHub username"
        className="h-9 w-52 rounded-lg bg-background/60 pl-8 text-xs"
      />
    </form>
  );
}

export function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const loginHref = `/login?callbackUrl=${encodeURIComponent(pathname || "/")}`;
  const signupHref = `/signup?callbackUrl=${encodeURIComponent(pathname || "/")}`;

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <HeaderSearch />
          <a
            href="https://github.com/zee5256/devpulse"
            target="_blank"
            rel="noreferrer"
            aria-label="DevPulse on GitHub"
            className="grid size-9 place-items-center rounded-xl border border-border bg-surface text-muted-foreground transition-colors hover:border-accent/30 hover:text-foreground"
          >
            <GithubIcon className="size-4" aria-hidden />
          </a>
          <ThemeToggle />
          {status === "loading" ? (
            <span className="h-9 w-24 animate-pulse rounded-xl bg-muted" />
          ) : session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Open account menu"
                  className="rounded-full ring-offset-2 ring-offset-background transition-shadow hover:ring-2 hover:ring-accent/30 focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Avatar
                    src={session.user.image}
                    alt={session.user.name ?? "Your avatar"}
                    name={session.user.name}
                    login={session.user.githubUsername ?? "you"}
                    className="size-9"
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="normal-case tracking-normal">
                  <span className="block text-xs font-semibold text-foreground">
                    {session.user.name ?? "Signed in"}
                  </span>
                  {session.user.githubUsername ? (
                    <span className="block text-[11px] font-normal text-muted-foreground">
                      @{session.user.githubUsername}
                    </span>
                  ) : null}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard />
                    My dashboard
                  </Link>
                </DropdownMenuItem>
                {session.user.githubUsername ? (
                  <DropdownMenuItem asChild>
                    <Link href={`/u/${session.user.githubUsername}`}>
                      <Sparkles />
                      My public profile
                    </Link>
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => {
                    void signOut({ redirectTo: "/" });
                  }}
                >
                  <LogOut />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href={signupHref}>Sign up</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href={loginHref}>Sign in</Link>
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-border/70 px-4 py-4 md:hidden">
          <HeaderSearch onNavigate={() => setMobileOpen(false)} />
          <nav className="mt-4 grid gap-1" aria-label="Mobile">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Bookmark className="size-4" />
              My dashboard
            </Link>
            <a
              href="https://github.com/zee5256/devpulse"
              target="_blank"
              rel="noreferrer"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <GithubIcon className="size-4" />
              GitHub repo
              <ArrowUpRight className="ml-auto size-3.5" />
            </a>
          </nav>
          <div className="mt-4">
            {session?.user ? (
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => {
                  void signOut({ redirectTo: "/" });
                }}
              >
                <LogOut className="size-4" />
                Sign out
              </Button>
            ) : (
              <div className="grid gap-2">
                <Button variant="secondary" asChild className="w-full">
                  <Link href={loginHref} onClick={() => setMobileOpen(false)}>
                    Sign in
                  </Link>
                </Button>
                <Button asChild className="w-full">
                  <Link href={signupHref} onClick={() => setMobileOpen(false)}>
                    Create an account
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
