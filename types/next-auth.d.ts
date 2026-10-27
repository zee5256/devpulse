import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      githubUsername?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    githubUsername?: string | null;
  }
}

declare module "next-auth/adapters" {
  interface AdapterUser {
    githubUsername?: string | null;
  }
}
