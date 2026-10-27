import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "DevPulse — GitHub analytics, in focus";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#070b09",
          backgroundImage:
            "radial-gradient(circle at 50% 0%, rgba(74,222,128,0.18), transparent 50%)",
          color: "#f1f7f3",
          fontFamily: "sans-serif",
          padding: 70,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 76,
            height: 76,
            borderRadius: 22,
            backgroundColor: "#4ade80",
            color: "#070b09",
            fontSize: 46,
            fontWeight: 800,
          }}
        >
          ⌁
        </div>
        <div style={{ display: "flex", fontSize: 76, fontWeight: 800, marginTop: 30 }}>
          Dev<span style={{ color: "#4ade80" }}>Pulse</span>
        </div>
        <div style={{ display: "flex", fontSize: 30, color: "#96a79d", marginTop: 16 }}>
          Your GitHub footprint, in focus.
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 34,
            borderRadius: 999,
            border: "1px solid #1d2a23",
            padding: "12px 24px",
            fontSize: 18,
            color: "#96a79d",
            letterSpacing: 2,
          }}
        >
          CONTRIBUTIONS · LANGUAGES · DEVELOPER SCORE
        </div>
      </div>
    ),
    { ...size },
  );
}
