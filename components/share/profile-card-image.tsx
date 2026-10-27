/* eslint-disable @next/next/no-img-element -- Satori/ImageResponse needs a raw img. */
import { siteConfig } from "@/lib/constants";
import type { ProfileResult } from "@/lib/cache/profile";
import { formatCompact, formatNumber } from "@/lib/utils";

const ACCENT = "#4ade80";
const BG = "#070b09";
const CARD = "#0e1512";
const BORDER = "#1d2a23";
const TEXT = "#f1f7f3";
const MUTED = "#96a79d";

function siteHost(): string {
  try {
    return new URL(siteConfig.url).host;
  } catch {
    return "devpulse.vercel.app";
  }
}

function clamp(text: string, length: number) {
  return text.length > length ? `${text.slice(0, length - 1)}…` : text;
}

function ScoreGauge({
  score,
  grade,
  label,
}: {
  score: number;
  grade: string;
  label: string;
}) {
  const percent = Math.min(100, Math.max(0, score));

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline" }}>
        <div
          style={{
            display: "flex",
            fontSize: 84,
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: -2,
          }}
        >
          {score}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 17,
            color: MUTED,
            marginLeft: 4,
          }}
        >
          /100
        </div>
      </div>
      <div
        style={{
          display: "flex",
          width: "100%",
          height: 10,
          borderRadius: 5,
          backgroundColor: "#1c2b23",
          marginTop: 14,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            width: `${percent}%`,
            height: 10,
            borderRadius: 5,
            backgroundColor: ACCENT,
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginTop: 13,
          fontSize: 12,
          letterSpacing: 2,
          color: ACCENT,
        }}
      >
        GRADE {grade} · {label.toUpperCase()}
      </div>
    </div>
  );
}

export function ProfileCardImage({ profile }: { profile: ProfileResult }) {
  const { data, score } = profile;
  const name = data.user.name ?? data.user.login;
  const bio = data.user.bio
    ? clamp(data.user.bio, 150)
    : "Building in public on GitHub.";

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: BG,
        backgroundImage:
          "radial-gradient(circle at 80% 0%, rgba(74,222,128,0.15), transparent 45%), radial-gradient(circle at 0% 100%, rgba(74,222,128,0.08), transparent 40%)",
        color: TEXT,
        padding: "46px 58px",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 38,
              height: 38,
              borderRadius: 11,
              backgroundColor: ACCENT,
              color: BG,
              fontSize: 23,
              fontWeight: 800,
              marginRight: 12,
            }}
          >
            ⌁
          </div>
          <div style={{ display: "flex", fontSize: 22, fontWeight: 800 }}>
            Dev<span style={{ color: ACCENT }}>Pulse</span>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            borderRadius: 999,
            border: `1px solid ${BORDER}`,
            backgroundColor: "rgba(14,21,18,0.7)",
            padding: "7px 14px",
            fontSize: 11,
            color: MUTED,
            letterSpacing: 2,
          }}
        >
          GITHUB ANALYTICS
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flex: 1,
          marginTop: 32,
          borderRadius: 28,
          border: `1px solid ${BORDER}`,
          backgroundColor: CARD,
          padding: 34,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            paddingRight: 30,
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <img
              src={data.user.avatarUrl}
              alt=""
              width={92}
              height={92}
              style={{
                width: 92,
                height: 92,
                borderRadius: 46,
                border: "3px solid #1d2a23",
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", marginLeft: 20 }}>
              <div
                style={{
                  display: "flex",
                  fontSize: 34,
                  fontWeight: 800,
                  lineHeight: 1.1,
                }}
              >
                {clamp(name, 28)}
              </div>
              <div style={{ display: "flex", fontSize: 18, color: ACCENT, marginTop: 5 }}>
                @{data.user.login}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 22,
              fontSize: 17,
              lineHeight: 1.45,
              color: MUTED,
              minHeight: 50,
            }}
          >
            {bio}
          </div>

          <div style={{ display: "flex", marginTop: 14 }}>
            {[
              ["Commits", formatNumber(data.stats.commits)],
              ["Stars", formatCompact(data.stats.stars)],
              ["Followers", formatCompact(data.stats.followers)],
              ["Streak", `${data.stats.longestStreak}d`],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  marginRight: 12,
                  borderRadius: 14,
                  border: `1px solid ${BORDER}`,
                  backgroundColor: "#0a100d",
                  padding: "12px 16px",
                  minWidth: 112,
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 800 }}>{value}</div>
                <div style={{ fontSize: 10, color: MUTED, marginTop: 3, letterSpacing: 1 }}>
                  {label.toUpperCase()}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: "auto",
              paddingTop: 18,
              borderTop: `1px solid ${BORDER}`,
              fontSize: 12,
              color: MUTED,
            }}
          >
            {data.languages.slice(0, 4).map((language) => (
              <div
                key={language.name}
                style={{ display: "flex", alignItems: "center", marginRight: 16 }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: language.color,
                    marginRight: 6,
                  }}
                />
                {language.name}
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: 330,
            borderLeft: `1px solid ${BORDER}`,
            paddingLeft: 30,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 11,
              color: MUTED,
              letterSpacing: 3,
              marginBottom: 10,
            }}
          >
            DEVELOPER SCORE
          </div>
          <ScoreGauge
            score={score.total}
            grade={score.grade}
            label={score.label}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              marginTop: 24,
            }}
          >
            {score.categories.map((category) => (
              <div key={category.key} style={{ display: "flex", flexDirection: "column", marginBottom: 12 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 11,
                    color: MUTED,
                    marginBottom: 5,
                  }}
                >
                  <span>{category.label}</span>
                  <span>
                    {category.score}/{category.max}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    width: "100%",
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: "#1c2b23",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      width: `${Math.round((category.score / category.max) * 100)}%`,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: ACCENT,
                      opacity: 0.55 + (category.score / category.max) * 0.45,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          color: MUTED,
          marginTop: 22,
          letterSpacing: 1,
        }}
      >
        <span>{siteHost()}/u/{data.user.login}</span>
        <span>TRANSPARENT · CACHED · SHAREABLE</span>
      </div>
    </div>
  );
}

export function FallbackCardImage({ username }: { username?: string }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: BG,
        color: TEXT,
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 64,
          height: 64,
          borderRadius: 18,
          backgroundColor: ACCENT,
          color: BG,
          fontSize: 38,
          fontWeight: 800,
        }}
      >
        ⌁
      </div>
      <div style={{ display: "flex", fontSize: 44, fontWeight: 800, marginTop: 24 }}>
        Dev<span style={{ color: ACCENT }}>Pulse</span>
      </div>
      <div style={{ display: "flex", fontSize: 18, color: MUTED, marginTop: 10 }}>
        {username ? `Profile preview for @${username}` : "GitHub analytics, in focus."}
      </div>
    </div>
  );
}
