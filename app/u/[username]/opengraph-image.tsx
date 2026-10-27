import { ImageResponse } from "next/og";

import {
  FallbackCardImage,
  ProfileCardImage,
} from "@/components/share/profile-card-image";
import { getProfile } from "@/lib/cache/profile";
import { usernameSchema } from "@/lib/validations";

export const runtime = "nodejs";
export const alt = "DevPulse developer profile card";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const parsed = usernameSchema.safeParse(username);
  if (!parsed.success) {
    return new ImageResponse(<FallbackCardImage />, { ...size });
  }

  try {
    const profile = await getProfile(parsed.data, {
      ip: "opengraph",
      allowStale: true,
    });
    return new ImageResponse(<ProfileCardImage profile={profile} />, {
      ...size,
      headers: {
        "Cache-Control":
          "public, max-age=3600, s-maxage=10800, stale-while-revalidate=86400",
      },
    });
  } catch {
    return new ImageResponse(<FallbackCardImage username={parsed.data} />, {
      ...size,
    });
  }
}
