import { ImageResponse } from "next/og";
import { getArchiveStats, type ArchiveStats } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SIZE = {
  width: 1200,
  height: 630,
};

const COLORS = {
  background: "#F5F3EE",
  surface: "#FFFEFC",
  card: "#FFFCF5",
  raised: "#EAE7DF",
  edge: "#DEDCD6",
  cardEdge: "#D7D0C3",
  cardLine: "#E5DED2",
  ink: "#25241F",
  text: "#514F49",
  muted: "#706D66",
  accent: "#A94426",
};

const FALLBACK_ROUNDS = [
  { type: "online_assessment", questions: 0 },
  { type: "technical_interview", questions: 0 },
  { type: "hr_interview", questions: 0 },
];

let fontCache: {
  regular: ArrayBuffer;
  semibold: ArrayBuffer;
  mono: ArrayBuffer;
} | null = null;

async function loadFonts(origin: string) {
  if (fontCache) return fontCache;

  try {
    const [regular, semibold, mono] = await Promise.all([
      fetch(`${origin}/fonts/Geist-Regular.ttf`),
      fetch(`${origin}/fonts/Geist-SemiBold.ttf`),
      fetch(`${origin}/fonts/GeistMono-Regular.ttf`),
    ]);

    if (!regular.ok || !semibold.ok || !mono.ok) {
      throw new Error("Font asset request failed");
    }

    fontCache = {
      regular: await regular.arrayBuffer(),
      semibold: await semibold.arrayBuffer(),
      mono: await mono.arrayBuffer(),
    };
    return fontCache;
  } catch (error) {
    console.error("[og] font load failed", error);
    return null;
  }
}

function roundTypeLabel(type: string | null | undefined) {
  if (!type) return "Interview";
  return type
    .replace(/_/g, " ")
    .replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

function formatNumber(value: number | null) {
  return value === null ? "—" : value.toLocaleString("en-US");
}

function questionLabel(count: number | null) {
  if (count === null) return "—";
  return `${count} question${count === 1 ? "" : "s"}`;
}

function Stat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        flexDirection: "column",
        gap: 4,
        paddingLeft: 20,
        borderLeft: `1px solid ${COLORS.edge}`,
      }}
    >
      <div
        style={{
          display: "flex",
          color: COLORS.ink,
          fontFamily: "Geist Mono",
          fontSize: 20,
          fontWeight: 600,
          lineHeight: 1.15,
        }}
      >
        {value}
      </div>
      <div
        style={{
          display: "flex",
          color: COLORS.muted,
          fontSize: 12,
          lineHeight: 1.3,
        }}
      >
        {label}
      </div>
    </div>
  );
}

function RoundRow({
  index,
  type,
  questions,
}: {
  index: number;
  type: string;
  questions: number | null;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        minHeight: 54,
        padding: "9px 8px",
        borderBottom: `1px solid ${COLORS.cardLine}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 28,
          height: 28,
          flexShrink: 0,
          border: `1px solid ${COLORS.cardEdge}`,
          borderRadius: 5,
          color: COLORS.accent,
          fontFamily: "Geist Mono",
          fontSize: 12,
        }}
      >
        {String(index + 1).padStart(2, "0")}
      </div>
      <div
        style={{
          display: "flex",
          flex: 1,
          minWidth: 0,
          flexDirection: "column",
          gap: 3,
        }}
      >
        <div
          style={{
            display: "flex",
            color: COLORS.ink,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          Round {index + 1}
        </div>
        <div
          style={{
            display: "flex",
            color: COLORS.muted,
            fontSize: 12,
          }}
        >
          {roundTypeLabel(type)}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          color: COLORS.text,
          fontFamily: "Geist Mono",
          fontSize: 12,
        }}
      >
        {questionLabel(questions)}
      </div>
    </div>
  );
}

export async function GET(request: Request) {
  let stats: ArchiveStats | null = null;
  try {
    stats = await getArchiveStats();
  } catch (error) {
    console.error("[og] stats load failed", error);
  }

  const origin = new URL(request.url).origin;
  const fonts = await loadFonts(origin);

  const rounds =
    stats?.sampleRounds && stats.sampleRounds.length > 0
      ? stats.sampleRounds
      : FALLBACK_ROUNDS;
  const hasStats = stats !== null;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          flexDirection: "column",
          backgroundColor: COLORS.background,
          color: COLORS.ink,
          fontFamily: "Geist",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 60,
            padding: "0 40px",
            borderBottom: `1px solid ${COLORS.edge}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <div
              style={{
                display: "flex",
                color: COLORS.ink,
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              0xTrace
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
              <div
                style={{
                  display: "flex",
                  padding: "7px 11px",
                  borderRadius: 6,
                  backgroundColor: COLORS.raised,
                  color: COLORS.ink,
                  fontSize: 13,
                }}
              >
                Home
              </div>
              {["Experiences", "Questions", "Analytics", "About"].map((item) => (
                <div
                  key={item}
                  style={{
                    display: "flex",
                    padding: "7px 11px",
                    color: COLORS.muted,
                    fontSize: 13,
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              color: COLORS.text,
              fontSize: 13,
            }}
          >
            Log in
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            gap: 44,
            padding: "34px 40px 24px",
          }}
        >
          <div
            style={{
              display: "flex",
              width: 556,
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                color: COLORS.muted,
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              Campus placement interview archive
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginTop: 16,
                marginBottom: 14,
                color: COLORS.ink,
                fontSize: 55,
                fontWeight: 600,
                lineHeight: 1.03,
                letterSpacing: -1.8,
              }}
            >
              <div style={{ display: "flex" }}>
                See how campus interviews unfold,
              </div>
              <div style={{ display: "flex", color: COLORS.accent }}>
                round by round.
              </div>
            </div>

            <div
              style={{
                display: "flex",
                maxWidth: 520,
                color: COLORS.text,
                fontSize: 17,
                lineHeight: 1.55,
              }}
            >
              Browse candidate accounts by company and role. Follow the reported
              questions through each round, with the original writeup kept
              alongside.
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 252,
                height: 46,
                marginTop: 22,
                borderRadius: 7,
                backgroundColor: COLORS.accent,
                color: "#FFFFFF",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Browse interview experiences
            </div>

            <div
              style={{
                display: "flex",
                marginTop: 14,
                color: COLORS.muted,
                fontSize: 12,
              }}
            >
              Accounts are candidate-reported and may not reflect every
              interview.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flex: 1,
              minWidth: 0,
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                border: `1px solid ${COLORS.cardEdge}`,
                borderRadius: 12,
                backgroundColor: COLORS.card,
                boxShadow: "0 8px 24px rgba(37, 36, 31, 0.07)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  height: 42,
                  padding: "0 18px",
                  borderBottom: `1px solid ${COLORS.cardLine}`,
                  color: COLORS.muted,
                  fontSize: 12,
                }}
              >
                <div style={{ display: "flex" }}>Candidate account</div>
                <div
                  style={{
                    display: "flex",
                    fontFamily: "Geist Mono",
                    fontSize: 11,
                  }}
                >
                  Preview record
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "18px 20px 10px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    color: COLORS.muted,
                    fontSize: 12,
                  }}
                >
                  Interview record
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 14,
                    marginTop: 10,
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 3,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        color: COLORS.ink,
                        fontSize: 22,
                        fontWeight: 600,
                        letterSpacing: -0.4,
                      }}
                    >
                      Company name
                    </div>
                    <div
                      style={{
                        display: "flex",
                        color: COLORS.text,
                        fontSize: 13,
                      }}
                    >
                      Software Engineer
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      color: COLORS.muted,
                      fontSize: 11,
                      paddingTop: 4,
                    }}
                  >
                    Candidate-reported
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    borderTop: `1px solid ${COLORS.cardLine}`,
                  }}
                >
                  {rounds.map((round, index) => (
                    <RoundRow
                      key={`${round.type}-${index}`}
                      index={index}
                      type={round.type}
                      questions={hasStats ? round.questions : null}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "9px 2px 0",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                {[0, 1, 2, 3, 4].map((index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      padding: "3px 5px 5px",
                      color: index === 0 ? COLORS.accent : COLORS.muted,
                      fontFamily: "Geist Mono",
                      fontSize: 11,
                    }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </div>
                ))}
              </div>
              <div
                style={{
                  display: "flex",
                  color: COLORS.muted,
                  fontFamily: "Geist Mono",
                  fontSize: 11,
                }}
              >
                01 / 05
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "15px 40px 17px",
            borderTop: `1px solid ${COLORS.edge}`,
            borderBottom: `1px solid ${COLORS.edge}`,
          }}
        >
          <div
            style={{
              display: "flex",
              width: 168,
              color: COLORS.text,
              fontSize: 13,
            }}
          >
            In the archive
          </div>
          <Stat
            value={formatNumber(stats ? stats.experiences : null)}
            label="candidate accounts"
          />
          <Stat
            value={formatNumber(stats ? stats.companies : null)}
            label="companies"
          />
          <Stat
            value={formatNumber(stats ? stats.rounds : null)}
            label="interview rounds"
          />
          <Stat
            value={formatNumber(stats ? stats.questions : null)}
            label="reported questions"
          />
        </div>
      </div>
    ),
    {
      ...SIZE,
      fonts: fonts
        ? [
            {
              name: "Geist",
              data: fonts.regular,
              weight: 400,
              style: "normal",
            },
            {
              name: "Geist",
              data: fonts.semibold,
              weight: 600,
              style: "normal",
            },
            {
              name: "Geist Mono",
              data: fonts.mono,
              weight: 400,
              style: "normal",
            },
          ]
        : undefined,
      headers: {
        "Cache-Control":
          "public, s-maxage=300, stale-while-revalidate=86400",
      },
    }
  );
}
