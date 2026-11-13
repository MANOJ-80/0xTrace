import { ImageResponse } from "next/og";
import { getExperienceById } from "@/lib/data";
import { publicCandidateName } from "@/lib/public-experience";

export const runtime = "nodejs";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Image({ params }: Props) {
  const { id } = await params;
  let record = null;
  try {
    record = await getExperienceById(id);
  } catch (e) {
    // Graceful fallback
  }

  // Pending and rejected records are not public, and the preview must not
  // reveal a full candidate name. Treat unpublished records as missing.
  const isUnpublished =
    record?.moderation_status === "pending" ||
    record?.moderation_status === "rejected";
  const exp = isUnpublished ? null : record;

  const companyName =
    exp?.company?.name || exp?.company?.normalized_name || "Campus Placement";
  const role = exp?.job?.role || "Software Engineer";
  const candidateName =
    publicCandidateName(exp?.candidate?.name) || "Student Candidate";
  const candidateDegree = exp?.candidate?.degree || "B.Tech / B.E";
  const candidateDept = exp?.candidate?.department
    ? `${candidateDegree} - ${exp.candidate.department}`
    : `${candidateDegree} - Engineering`;
  const college = exp?.candidate?.college || "PSG iTech";

  const outcomeStatus = (exp?.outcome?.status || "Selected").trim();
  const isSelected =
    outcomeStatus.toLowerCase().includes("select") ||
    outcomeStatus.toLowerCase().includes("placed");
  const isRejected = outcomeStatus.toLowerCase().includes("reject");

  const roundsCount = exp?.rounds?.length || 0;

  // Aggregate questions count
  let questionsCount = 0;
  let codingCount = 0;
  if (exp?.rounds) {
    for (const r of exp.rounds) {
      if (r.questions && Array.isArray(r.questions)) {
        questionsCount += r.questions.length;
      }
      if (r.coding?.problems && Array.isArray(r.coding.problems)) {
        codingCount += r.coding.problems.length;
      } else if (r.coding?.problem_count) {
        codingCount += r.coding.problem_count;
      }
    }
  }

  const compensation = exp?.compensation?.ctc || null;
  const driveType =
    exp?.timeline?.drive_type || exp?.job?.employment_type || "Intern + FTE";

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
            "radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.16) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(34, 197, 94, 0.1) 0%, transparent 40%)",
          padding: "48px 56px",
          fontFamily: "sans-serif",
          color: "#E8E9ED",
        }}
      >
        {/* Top Header */}
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
                borderRadius: "10px",
                padding: "6px 14px",
                color: "#FFFFFF",
                fontSize: "20px",
                fontWeight: 900,
                marginRight: "14px",
              }}
            >
              0x
            </div>
            <div
              style={{
                display: "flex",
                fontSize: "30px",
                fontWeight: 800,
                letterSpacing: "-0.5px",
                color: "#FFFFFF",
                marginRight: "14px",
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
                padding: "5px 14px",
                fontSize: "13px",
                fontWeight: 600,
                color: "#9CA3AF",
              }}
            >
              Verified Placement Intel
            </div>
          </div>

          {/* Outcome Status Pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: isSelected
                ? "rgba(34, 197, 94, 0.15)"
                : isRejected
                ? "rgba(239, 68, 68, 0.15)"
                : "rgba(59, 130, 246, 0.15)",
              border: `2px solid ${
                isSelected ? "#22C55E" : isRejected ? "#EF4444" : "#3B82F6"
              }`,
              borderRadius: "9999px",
              padding: "8px 20px",
              fontSize: "16px",
              fontWeight: 800,
              color: isSelected ? "#4ADE80" : isRejected ? "#F87171" : "#93C5FD",
              textTransform: "capitalize",
            }}
          >
            {outcomeStatus}
          </div>
        </div>

        {/* Hero Company & Role Section */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: "52px",
              fontWeight: 900,
              letterSpacing: "-1.5px",
              lineHeight: 1.1,
              color: "#FFFFFF",
              marginBottom: "12px",
            }}
          >
            {companyName}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: "26px",
                fontWeight: 600,
                color: "#93C5FD",
                marginRight: "16px",
              }}
            >
              {role}
            </div>

            {compensation ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "rgba(245, 158, 11, 0.12)",
                  border: "1px solid #F59E0B",
                  borderRadius: "8px",
                  padding: "4px 12px",
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "#FBBF24",
                  marginRight: "12px",
                }}
              >
                {compensation}
              </div>
            ) : null}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#16171C",
                border: "1px solid #2A2B33",
                borderRadius: "8px",
                padding: "4px 12px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#9CA3AF",
              }}
            >
              {driveType}
            </div>
          </div>
        </div>

        {/* Candidate & Interview Stats Bento Card */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#16171C",
            border: "1px solid #2A2B33",
            borderRadius: "20px",
            padding: "24px 32px",
            width: "100%",
          }}
        >
          {/* Candidate Profile */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "1px",
                color: "#6B6E7A",
                textTransform: "uppercase",
                marginBottom: "4px",
              }}
            >
              CANDIDATE
            </div>
            <div
              style={{
                display: "flex",
                fontSize: "26px",
                fontWeight: 800,
                color: "#FFFFFF",
                marginBottom: "4px",
              }}
            >
              {candidateName}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: "15px",
                fontWeight: 500,
                color: "#9CA3AF",
              }}
            >
              {candidateDept} - {college}
            </div>
          </div>

          {/* Stats Pills */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#1E1F26",
                border: "1px solid #2A2B33",
                borderRadius: "14px",
                padding: "12px 22px",
                minWidth: "110px",
                marginRight: "12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: "24px",
                  fontWeight: 800,
                  color: "#60A5FA",
                }}
              >
                {String(roundsCount)}
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#9CA3AF",
                  marginTop: "2px",
                }}
              >
                Rounds
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#1E1F26",
                border: "1px solid #2A2B33",
                borderRadius: "14px",
                padding: "12px 22px",
                minWidth: "110px",
                marginRight: codingCount > 0 ? "12px" : "0px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: "24px",
                  fontWeight: 800,
                  color: "#34D399",
                }}
              >
                {questionsCount > 0 ? String(questionsCount) : "Full"}
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#9CA3AF",
                  marginTop: "2px",
                }}
              >
                Questions
              </div>
            </div>

            {codingCount > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#1E1F26",
                  border: "1px solid #2A2B33",
                  borderRadius: "14px",
                  padding: "12px 22px",
                  minWidth: "110px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontSize: "24px",
                    fontWeight: 800,
                    color: "#FBBF24",
                  }}
                >
                  {String(codingCount)}
                </div>
                <div
                  style={{
                    display: "flex",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#9CA3AF",
                    marginTop: "2px",
                  }}
                >
                  Coding Tasks
                </div>
              </div>
            ) : null}
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
            paddingTop: "18px",
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
            Verbatim Questions - Round-by-Round Breakdown - Candidate Advice
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
