import { PrismaClient } from "@prisma/client";

import { fetchGithubProfile } from "../lib/github/client";
import { calculateScore } from "../lib/score/calculate";
import { DEMO_USERS } from "../lib/constants";

const prisma = new PrismaClient();

async function main() {
  let failures = 0;

  for (const username of DEMO_USERS) {
    process.stdout.write(`Prewarming @${username}… `);
    try {
      const data = await fetchGithubProfile(username);
      const score = calculateScore(data);
      const fetchedAt = new Date();

      await prisma.profileSnapshot.upsert({
        where: { username },
        create: {
          username,
          data,
          score: score.total,
          fetchedAt,
        },
        update: {
          data,
          score: score.total,
          fetchedAt,
        },
      });

      console.log(`done — ${score.total}/100 (${score.grade})`);
    } catch (error) {
      failures += 1;
      console.log("failed");
      console.error(
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  if (failures === DEMO_USERS.length) {
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
