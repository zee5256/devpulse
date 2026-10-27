import { auth } from "@/lib/auth";
import { jsonData, jsonError, readJson } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { favoriteSchema } from "@/lib/validations";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return jsonError("Sign in to view favorites.", 401, "UNAUTHORIZED");
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, username: true, createdAt: true },
  });

  return jsonData({ favorites });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return jsonError("Sign in to save developers.", 401, "UNAUTHORIZED");
  }

  const parsed = favoriteSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return jsonError("Enter a valid GitHub username.", 400, "INVALID_USERNAME");
  }

  const favorite = await prisma.favorite.upsert({
    where: {
      userId_username: {
        userId: session.user.id,
        username: parsed.data.username,
      },
    },
    create: {
      userId: session.user.id,
      username: parsed.data.username,
    },
    update: {},
    select: { id: true, username: true, createdAt: true },
  });

  return jsonData({ favorite }, 201);
}
