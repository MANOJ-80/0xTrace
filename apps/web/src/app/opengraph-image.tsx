import { ImageResponse } from "next/og";
import { getExperienceSummaries } from "@/lib/data";

export const runtime = "nodejs";

// Read the live archive counts when the preview is requested. Rendering this
// at build time would freeze the numbers and require a database in CI.
export const dynamic = "force-dynamic";

export const alt = "0xTrace — Campus Interview Intelligence";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const FALLBACK_STATS = {
  experiences: 127,
  companies: 45,
  questions: 490,
};

async function loadStats() {
  try {
    const experiences = await getExperienceSummaries();
    const companies = new Set(
      experiences.map((experience) => experience.company?.name).filter(Boolean)
    );
    const questions = experiences.reduce(
      (total, experience) => total + experience.question_count,
      0
    );

    return {
      experiences: experiences.length,
      companies: companies.size,
      questions,
    };
  } catch (error) {
    // A missing database must not break link previews.
    return FALLBACK_STATS;
  }
}

export default async function Image() {
  const stats = await loadStats();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0C0D10",
          backgroundImage:
            "radial-gradient(circle at 15% 15%, rgba(59, 130, 246, 0.15) 0%, transparent 45%), radial-gradient(circle at 85% 85%, rgba(34, 197, 94, 0.08) 0%, transparent 45%)",
          padding: "52px 64px",
          fontFamily: "sans-serif",
          color: "#E8E9ED",
        }}
      >
        {/* Top Header Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          {/* Logo Brand */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#1E40AF",
                border: "2px solid #3B82F6",
                borderRadius: "12px",
                padding: "8px 16px",
                color: "#FFFFFF",
                fontSize: "24px",
                fontWeight: 900,
                letterSpacing: "-0.5px",
                marginRight: "16px",
              }}
            >
              0x
            </div>
            <div
              style={{
                display: "flex",
                fontSize: "36px",
                fontWeight: 800,
                letterSpacing: "-1px",
                color: "#FFFFFF",
                marginRight: "16px",
              }}
            >
              0xTrace
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#16171C",
                border: "1px solid #2A2B33",
                borderRadius: "9999px",
                padding: "6px 14px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#9CA3AF",
              }}
            >
              Campus Interview Intelligence
            </div>
          </div>

          {/* College Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "rgba(34, 197, 94, 0.12)",
              border: "1px solid #22C55E",
              borderRadius: "9999px",
              padding: "8px 18px",
              fontSize: "14px",
              fontWeight: 700,
              color: "#4ADE80",
            }}
          >
            <div
              style={{
                display: "flex",
                width: "8px",
                height: "8px",
                borderRadius: "9999px",
                backgroundColor: "#22C55E",
                marginRight: "8px",
              }}
            />
            PSG iTech & Tech Placement Archive
          </div>
        </div>

        {/* Center Hero */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: "16px",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: "56px",
              fontWeight: 900,
              letterSpacing: "-1.5px",
              lineHeight: 1.12,
              color: "#FFFFFF",
              maxWidth: "1050px",
              marginBottom: "14px",
            }}
          >
            {stats.experiences} Audited Campus Placement Experiences
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "22px",
              fontWeight: 500,
              color: "#9CA3AF",
              lineHeight: 1.4,
              maxWidth: "960px",
            }}
          >
            Verbatim coding questions, round-by-round interview breakdowns, and
            lossless transcripts from top tier tech recruiters.
          </div>
        </div>

        {/* Bento Stats Row */}
        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            width: "100%",
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#16171C",
              border: "1px solid #2A2B33",
              borderRadius: "16px",
              padding: "20px 22px",
              marginRight: "16px",
            }}
          >
            <div style={{ display: "flex", fontSize: "32px", fontWeight: 800, color: "#60A5FA" }}>
              {stats.experiences}
            </div>
            <div style={{ display: "flex", fontSize: "14px", color: "#9CA3AF", fontWeight: 600, marginTop: "4px" }}>
              Verified Experiences
            </div>
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#16171C",
              border: "1px solid #2A2B33",
              borderRadius: "16px",
              padding: "20px 22px",
              marginRight: "16px",
            }}
          >
            <div style={{ display: "flex", fontSize: "32px", fontWeight: 800, color: "#4ADE80" }}>
              {stats.companies}+
            </div>
            <div style={{ display: "flex", fontSize: "14px", color: "#9CA3AF", fontWeight: 600, marginTop: "4px" }}>
              Top Recruiter Companies
            </div>
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#16171C",
              border: "1px solid #2A2B33",
              borderRadius: "16px",
              padding: "20px 22px",
              marginRight: "16px",
            }}
          >
            <div style={{ display: "flex", fontSize: "32px", fontWeight: 800, color: "#FBBF24" }}>
              {stats.questions}+
            </div>
            <div style={{ display: "flex", fontSize: "14px", color: "#9CA3AF", fontWeight: 600, marginTop: "4px" }}>
              Interview Questions
            </div>
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#16171C",
              border: "1px solid #2A2B33",
              borderRadius: "16px",
              padding: "20px 22px",
            }}
          >
            <div style={{ display: "flex", fontSize: "32px", fontWeight: 800, color: "#A78BFA" }}>
              100%
            </div>
            <div style={{ display: "flex", fontSize: "14px", color: "#9CA3AF", fontWeight: 600, marginTop: "4px" }}>
              Lossless Transcripts
            </div>
          </div>
        </div>

        {/* Footer Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            borderTop: "1px solid #2A2B33",
            paddingTop: "20px",
            marginTop: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: "15px",
              fontWeight: 500,
              color: "#6B6E7A",
            }}
          >
            Schneider - Amazon - Caterpillar - Oracle - Qualcomm - PhonePe - SAP Labs
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "17px",
              fontWeight: 700,
              color: "#60A5FA",
            }}
          >
            0x-trace.vercel.app
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
