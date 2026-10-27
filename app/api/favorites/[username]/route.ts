import { auth } from "@/lib/auth";
import { jsonData, jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { usernameSchema } from "@/lib/validations";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return jsonError("Sign in to manage favorites.", 401, "UNAUTHORIZED");
  }

  const raw = await params;
  const parsed = usernameSchema.safeParse(decodeURIComponent(raw.username));
  if (!parsed.success) {
    return jsonError("Enter a valid GitHub username.", 400, "INVALID_USERNAME");
  }

  await prisma.favorite.deleteMany({
    where: { userId: session.user.id, username: parsed.data },
  });

  return jsonData({ removed: true, username: parsed.data });
}
