import { ArrowUpRight, GitFork, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { TopRepository } from "@/lib/github/normalize";
import { formatCompact, relativeTime } from "@/lib/utils";

export function TopRepositories({ repos }: { repos: TopRepository[] }) {
  if (repos.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
        No public repositories found.
      </p>
    );
  }

  return (
    <div className="-mx-2 overflow-x-auto px-2">
      <table className="w-full min-w-[680px] text-left text-sm">
        <thead>
          <tr className="border-b border-border text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            <th className="pb-3 pl-2 font-semibold">Repository</th>
            <th className="pb-3 font-semibold">Language</th>
            <th className="pb-3 text-right font-semibold">Stars</th>
            <th className="pb-3 text-right font-semibold">Forks</th>
            <th className="pb-3 pr-2 text-right font-semibold">Updated</th>
          </tr>
        </thead>
        <tbody>
          {repos.map((repo, index) => (
            <tr
              key={repo.name}
              className="group border-b border-border/60 last:border-0 hover:bg-muted/30"
            >
              <td className="py-3.5 pl-2 pr-4">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 font-medium text-foreground hover:text-accent"
                    >
                      <span className="max-w-[260px] truncate">{repo.name}</span>
                      <ArrowUpRight className="size-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                    </a>
                    {repo.description ? (
                      <p className="mt-0.5 line-clamp-1 max-w-[420px] text-[11px] text-muted-foreground">
                        {repo.description}
                      </p>
                    ) : null}
                  </div>
                </div>
              </td>
              <td className="py-3.5 pr-4">
                {repo.language ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: repo.languageColor }}
                      aria-hidden
                    />
                    {repo.language}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </td>
              <td className="py-3.5 text-right">
                <span className="inline-flex items-center gap-1 font-mono text-xs text-foreground/80">
                  <Star className="size-3 text-muted-foreground" aria-hidden />
                  {formatCompact(repo.stars)}
                </span>
              </td>
              <td className="py-3.5 text-right">
                <span className="inline-flex items-center gap-1 font-mono text-xs text-foreground/80">
                  <GitFork className="size-3 text-muted-foreground" aria-hidden />
                  {formatCompact(repo.forks)}
                </span>
              </td>
              <td className="py-3.5 pr-2 text-right text-[11px] text-muted-foreground">
                {relativeTime(repo.updatedAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function RepoCountBadge({ count }: { count: number }) {
  return <Badge variant="muted">{count} public</Badge>;
}
