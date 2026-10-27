import { createElement } from "react";
import { ImageResponse } from "next/og";

import {
  FallbackCardImage,
  ProfileCardImage,
} from "@/components/share/profile-card-image";
import { getProfile } from "@/lib/cache/profile";
import { usernameSchema } from "@/lib/validations";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;
  const parsed = usernameSchema.safeParse(username);
  if (!parsed.success) {
    return new Response("Invalid username", { status: 400 });
  }

  const download = new URL(request.url).searchParams.get("download") === "1";
  let element: React.ReactElement;

  try {
    const profile = await getProfile(parsed.data, {
      ip: "card",
      allowStale: true,
    });
    element = createElement(ProfileCardImage, { profile });
  } catch {
    element = createElement(FallbackCardImage, { username: parsed.data });
  }

  return new ImageResponse(element, {
    width: 1200,
    height: 630,
    headers: {
      "Cache-Control":
        "public, max-age=3600, s-maxage=10800, stale-while-revalidate=86400",
      ...(download
        ? {
            "Content-Disposition": `attachment; filename="devpulse-${parsed.data}.png"`,
          }
        : {}),
    },
  });
}
