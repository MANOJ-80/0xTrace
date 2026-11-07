"use client";

import type { AnalyticsData } from "@/lib/data";

/* ------------------------------------------------------------------ */
/*  Reusable Chart Primitives                                          */
/* ------------------------------------------------------------------ */

function HBar({
  label,
  value,
  max,
  color = "bg-ox-accent",
  sub,
}: {
  label: string;
  value: number;
  max: number;
  color?: string;
  sub?: React.ReactNode;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="analytics-bar-row flex items-center gap-3 group">
      <span
        className="w-28 sm:w-40 text-xs sm:text-sm text-ox-text truncate group-hover:text-ox-ink transition-colors flex-shrink-0"
        title={label}
      >
        {label}
      </span>
      <div className="flex-1 h-2 bg-ox-surface-raised rounded-sm overflow-hidden min-w-0">
        {sub ? (
          sub
        ) : (
          <div
            className={`h-full ${color}`}
            style={{ width: `${Math.max(pct, 2)}%` }}
          />
        )}
      </div>
      <span className="w-8 text-xs font-mono text-ox-ink text-right tabular-nums flex-shrink-0">
        {value}
      </span>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="pb-3 border-b border-ox-edge mb-4">
      <div className="min-w-0">
        <h2 className="text-sm sm:text-base font-medium text-ox-ink leading-tight">{title}</h2>
        {subtitle && <p className="text-xs text-ox-muted truncate">{subtitle}</p>}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="analytics-stat flex flex-col p-3 sm:p-4">
      <span className="font-mono tabular-nums text-xl sm:text-2xl lg:text-3xl text-ox-ink leading-tight">{value}</span>
      <span className="text-[10px] sm:text-xs text-ox-muted mt-1 text-center">{label}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function AnalyticsDashboard({ data }: { data: AnalyticsData }) {
  const { totals, companyBreakdown, roundTypes, outcomes, questionTopics, difficulty, employmentTypes } = data;

  const maxCompany = companyBreakdown[0]?.count || 1;
  const maxRoundType = roundTypes[0]?.count || 1;
  const maxTopic = questionTopics[0]?.count || 1;

  const outcomeColors: Record<string, string> = {
    selected: "text-ox-signal-pass",
    rejected: "text-ox-signal-fail",
    other: "text-ox-signal-warn",
  };

  const diffColors: Record<string, string> = {
    easy: "bg-ox-signal-pass",
    medium: "bg-ox-signal-warn",
    hard: "bg-ox-signal-fail",
  };

  const diffTextColors: Record<string, string> = {
    easy: "text-ox-signal-pass",
    medium: "text-ox-signal-warn",
    hard: "text-ox-signal-fail",
  };

  return (
    <div className="space-y-8">
      {/* ---- Stats Strip ---- */}
      <div className="analytics-overview grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Experiences" value={totals.experiences} />
        <StatCard label="Companies" value={totals.companies} />
        <StatCard label="Rounds" value={totals.rounds} />
        <StatCard label="Questions" value={totals.questions} />
      </div>
      <p className="text-xs text-ox-muted">Also in the archive: {totals.codingProblems.toLocaleString()} coding problems and {totals.tips.toLocaleString()} candidate tips.</p>

      {/* ---- Outcome Cards ---- */}
      <div>
        <SectionHeader title="Reported outcomes" subtitle="Candidate-reported results across the archive" />
        <div className="outcome-strip grid grid-cols-3">
          {outcomes.map((o) => {
            const style = outcomeColors[o.status] || outcomeColors.other;
            return (
              <div key={o.status} className="outcome-cell">
                <span className={`font-mono tabular-nums text-2xl sm:text-3xl font-medium ${style}`}>{o.count}</span>
                <span className="text-xs text-ox-text capitalize">{o.status === "other" ? "Other" : o.status}</span>
                <span className="text-xs text-ox-muted">{o.pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ---- Company Leaderboard (full width) ---- */}
      <div className="analytics-panel p-4 sm:p-6">
        <SectionHeader title="Experiences by company" subtitle={`Top ${Math.min(15, companyBreakdown.length)} companies by account count`} />
        <div className="space-y-2">
          {companyBreakdown.slice(0, 15).map((c) => (
            <HBar
              key={c.name}
              label={c.name}
              value={c.count}
              max={maxCompany}
              sub={
                <div className="h-full flex">
                  {c.selected > 0 && (
                    <div
                      className="h-full bg-ox-signal-pass/75"
                      style={{ width: `${(c.selected / maxCompany) * 100}%` }}
                      title={`${c.selected} selected`}
                    />
                  )}
                  {c.rejected > 0 && (
                    <div
                      className="h-full bg-ox-signal-fail/75"
                      style={{ width: `${(c.rejected / maxCompany) * 100}%` }}
                      title={`${c.rejected} rejected`}
                    />
                  )}
                  {c.count - c.selected - c.rejected > 0 && (
                    <div
                      className="h-full bg-ox-muted/30"
                      style={{ width: `${((c.count - c.selected - c.rejected) / maxCompany) * 100}%` }}
                    />
                  )}
                </div>
              }
            />
          ))}
        </div>
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-ox-edge text-xs text-ox-muted">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-ox-signal-pass/75 flex-shrink-0" /> Selected</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-ox-signal-fail/75 flex-shrink-0" /> Rejected</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-ox-muted/50 flex-shrink-0" /> Other</span>
        </div>
      </div>

      {/* ---- Two-Column: Round Types + Question Topics ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Round Type Distribution */}
        <div className="analytics-panel p-4 sm:p-6">
          <SectionHeader title="Round types" subtitle={`${totals.rounds} rounds across ${roundTypes.length} types`} />
          <div className="space-y-2">
            {roundTypes.slice(0, 12).map((r) => (
              <HBar
                key={r.type}
                label={r.label}
                value={r.count}
                max={maxRoundType}
                color="bg-ox-accent"
              />
            ))}
          </div>
        </div>

        {/* Question Topics */}
        <div className="analytics-panel p-4 sm:p-6">
          <SectionHeader title="Question topics" subtitle={`Top ${Math.min(12, questionTopics.length)} most reported topics`} />
          <div className="space-y-2">
            {questionTopics.slice(0, 12).map((t) => (
              <HBar key={t.topic} label={t.topic} value={t.count} max={maxTopic} color="bg-ox-accent" />
            ))}
          </div>
        </div>
      </div>

      {/* ---- Two-Column: Difficulty + Employment ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Difficulty */}
        <div className="analytics-panel p-4 sm:p-6">
          <SectionHeader title="Round difficulty" subtitle="Distribution of explicitly tagged rounds" />
          {difficulty.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {difficulty.map((d) => (
                  <div key={d.level} className="bg-ox-void border border-ox-edge rounded-lg p-3 text-center">
                    <div className={`difficulty-mark mx-auto mb-2 ${diffColors[d.level] || "bg-ox-muted"}`} />
                    <span className={`font-mono tabular-nums text-xl font-medium ${diffTextColors[d.level] || "text-ox-ink"}`}>{d.count}</span>
                    <p className="text-xs text-ox-muted capitalize mt-0.5">{d.level}</p>
                    <p className="text-[10px] text-ox-muted">{d.pct}%</p>
                  </div>
                ))}
              </div>
              {/* Stacked bar */}
              <div className="difficulty-distribution overflow-hidden flex border border-ox-edge">
                {difficulty.map((d) => (
                  <div
                    key={d.level}
                    className={`h-full ${diffColors[d.level] || "bg-ox-muted"}`}
                    style={{ width: `${d.pct}%` }}
                    title={`${d.level}: ${d.count} (${d.pct}%)`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-ox-muted">No difficulty data tagged.</p>
          )}
        </div>

        {/* Employment Types */}
        <div className="analytics-panel p-4 sm:p-6">
          <SectionHeader title="Employment types" subtitle="Offer type distribution" />
          <div className="grid grid-cols-2 gap-3">
            {employmentTypes.map((e) => (
              <div key={e.type} className="bg-ox-void border border-ox-edge rounded-lg p-3 sm:p-4 text-center">
                <span className="font-mono tabular-nums text-xl sm:text-2xl font-bold text-ox-ink">{e.count}</span>
                <p className="text-xs text-ox-muted mt-1">{e.label}</p>
                <p className="text-[10px] text-ox-muted">{e.pct}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
