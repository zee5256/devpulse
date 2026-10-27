import { z } from "zod";

const languageSchema = z.object({
  name: z.string(),
  color: z.string().nullish(),
});

const repositorySchema = z.object({
  name: z.string(),
  description: z.string().nullish(),
  url: z.string(),
  stargazerCount: z.number(),
  forkCount: z.number(),
  updatedAt: z.string(),
  isArchived: z.boolean().optional(),
  primaryLanguage: languageSchema.nullish(),
  languages: z
    .object({
      edges: z.array(
        z.object({
          size: z.number(),
          node: languageSchema,
        }),
      ),
    })
    .nullish(),
});

const contributionDaySchema = z.object({
  date: z.string(),
  contributionCount: z.number(),
  weekday: z.number(),
});

const contributionsSchema = z.object({
  totalCommitContributions: z.number(),
  totalPullRequestContributions: z.number(),
  totalIssueContributions: z.number(),
  totalPullRequestReviewContributions: z.number(),
  restrictedContributionsCount: z.number(),
  contributionCalendar: z.object({
    totalContributions: z.number(),
    weeks: z.array(
      z.object({
        contributionDays: z.array(contributionDaySchema),
      }),
    ),
  }),
});

export const githubUserSchema = z.object({
  login: z.string(),
  name: z.string().nullish(),
  avatarUrl: z.string(),
  bio: z.string().nullish(),
  location: z.string().nullish(),
  createdAt: z.string(),
  url: z.string(),
  followers: z.object({ totalCount: z.number() }),
  following: z.object({ totalCount: z.number() }),
  repositories: z.object({
    totalCount: z.number(),
    nodes: z.array(repositorySchema),
  }),
  contributionsCollection: contributionsSchema.nullish(),
});

export const githubResponseSchema = z.object({
  data: z
    .object({
      user: githubUserSchema.nullish(),
    })
    .nullish(),
  errors: z
    .array(
      z.object({
        type: z.string().optional(),
        message: z.string(),
        path: z.array(z.unknown()).optional(),
      }),
    )
    .optional(),
});

export type GithubUser = z.infer<typeof githubUserSchema>;
export type GithubRepository = z.infer<typeof repositorySchema>;
export type GithubResponse = z.infer<typeof githubResponseSchema>;
