"use client";

import type { AnalyticsData } from "@/lib/data";
import {
  Building2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ListChecks,
  MessageSquare,
  Code2,
  Lightbulb,
  Users,
  Briefcase,
  Zap,
  TrendingUp,
} from "lucide-react";

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
    <div className="flex items-center gap-3 group">
      <span
        className="w-32 sm:w-40 text-xs sm:text-sm text-ox-muted truncate group-hover:text-ox-ink transition-colors flex-shrink-0"
        title={label}
      >
        {label}
      </span>
      <div className="flex-1 h-6 bg-ox-void rounded overflow-hidden border border-ox-edge min-w-0">
        {sub ? (
          sub
        ) : (
          <div
            className={`h-full ${color} rounded-sm`}
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

function SectionHeader({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-2.5 pb-3 border-b border-ox-edge mb-4">
      <div className="p-1.5 rounded-md bg-ox-accent/10 border border-ox-accent/30 flex-shrink-0">
        <Icon className="w-4 h-4 text-ox-accent" />
      </div>
      <div className="min-w-0">
        <h2 className="text-sm sm:text-base font-bold text-ox-ink leading-tight">{title}</h2>
        {subtitle && <p className="text-xs text-ox-muted truncate">{subtitle}</p>}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number | string; icon: React.ElementType }) {
  return (
    <div className="flex flex-col items-center p-3 sm:p-4 bg-ox-surface border border-ox-edge rounded-lg hover:border-ox-accent/40 transition-colors">
      <Icon className="w-4 h-4 text-ox-muted mb-1.5" />
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

  const outcomeColors: Record<string, { bg: string; border: string; text: string; icon: React.ElementType }> = {
    selected: { bg: "bg-green-900/20", border: "border-green-600", text: "text-green-400", icon: CheckCircle2 },
    rejected: { bg: "bg-red-900/20", border: "border-red-600", text: "text-red-400", icon: XCircle },
    other: { bg: "bg-amber-900/20", border: "border-amber-600", text: "text-amber-400", icon: HelpCircle },
  };

  const diffColors: Record<string, string> = {
    easy: "bg-green-500",
    medium: "bg-amber-500",
    hard: "bg-red-500",
  };

  const diffTextColors: Record<string, string> = {
    easy: "text-green-400",
    medium: "text-amber-400",
    hard: "text-red-400",
  };

  return (
    <div className="space-y-8">
      {/* ---- Stats Strip ---- */}
      <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        <StatCard label="Experiences" value={totals.experiences} icon={Users} />
        <StatCard label="Companies" value={totals.companies} icon={Building2} />
        <StatCard label="Rounds" value={totals.rounds} icon={ListChecks} />
        <StatCard label="Questions" value={totals.questions} icon={MessageSquare} />
        <StatCard label="Coding Problems" value={totals.codingProblems} icon={Code2} />
        <StatCard label="Tips Shared" value={totals.tips} icon={Lightbulb} />
      </div>

      {/* ---- Outcome Cards ---- */}
      <div>
        <SectionHeader icon={TrendingUp} title="Outcome Distribution" subtitle="Selection rates across all experiences" />
        <div className="grid grid-cols-3 gap-3">
          {outcomes.map((o) => {
            const style = outcomeColors[o.status] || outcomeColors.other;
            const Icon = style.icon;
            return (
              <div key={o.status} className={`${style.bg} border ${style.border} rounded-xl p-4 sm:p-5 flex flex-col items-center gap-1.5`}>
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${style.text}`} />
                <span className={`font-mono tabular-nums text-2xl sm:text-3xl font-bold ${style.text}`}>{o.count}</span>
                <span className="text-xs text-ox-muted capitalize">{o.status === "other" ? "Other" : o.status}</span>
                <span className="text-[10px] text-ox-muted">{o.pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ---- Company Leaderboard (full width) ---- */}
      <div className="bg-ox-surface border border-ox-edge rounded-xl p-4 sm:p-6">
        <SectionHeader icon={Building2} title="Company Leaderboard" subtitle={`Top ${Math.min(15, companyBreakdown.length)} companies by experience count`} />
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
                      className="h-full bg-green-500/70"
                      style={{ width: `${(c.selected / maxCompany) * 100}%` }}
                      title={`${c.selected} selected`}
                    />
                  )}
                  {c.rejected > 0 && (
                    <div
                      className="h-full bg-red-500/70"
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
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-green-500/70 flex-shrink-0" /> Selected</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-500/70 flex-shrink-0" /> Rejected</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-ox-muted/30 flex-shrink-0" /> Other</span>
        </div>
      </div>

      {/* ---- Two-Column: Round Types + Question Topics ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Round Type Distribution */}
        <div className="bg-ox-surface border border-ox-edge rounded-xl p-4 sm:p-6">
          <SectionHeader icon={ListChecks} title="Round Types" subtitle={`${totals.rounds} rounds across ${roundTypes.length} types`} />
          <div className="space-y-2">
            {roundTypes.slice(0, 12).map((r) => (
              <HBar
                key={r.type}
                label={r.label}
                value={r.count}
                max={maxRoundType}
                color={
                  r.type.includes("technical") ? "bg-blue-500" :
                  r.type.includes("hr") || r.type.includes("behavioral") || r.type.includes("managerial") ? "bg-purple-500" :
                  r.type.includes("coding") || r.type.includes("online") || r.type.includes("mcq") || r.type.includes("aptitude") ? "bg-amber-500" :
                  "bg-ox-accent"
                }
              />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-ox-edge text-xs text-ox-muted">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-blue-500 flex-shrink-0" /> Technical</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-purple-500 flex-shrink-0" /> HR / Managerial</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-500 flex-shrink-0" /> Assessment</span>
          </div>
        </div>

        {/* Question Topics */}
        <div className="bg-ox-surface border border-ox-edge rounded-xl p-4 sm:p-6">
          <SectionHeader icon={MessageSquare} title="Question Topics" subtitle={`Top ${Math.min(12, questionTopics.length)} most asked topics`} />
          <div className="space-y-2">
            {questionTopics.slice(0, 12).map((t) => (
              <HBar key={t.topic} label={t.topic} value={t.count} max={maxTopic} color="bg-cyan-500" />
            ))}
          </div>
        </div>
      </div>

      {/* ---- Two-Column: Difficulty + Employment ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Difficulty */}
        <div className="bg-ox-surface border border-ox-edge rounded-xl p-4 sm:p-6">
          <SectionHeader icon={Zap} title="Round Difficulty" subtitle="Distribution of explicitly tagged rounds" />
          {difficulty.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {difficulty.map((d) => (
                  <div key={d.level} className="bg-ox-void border border-ox-edge rounded-lg p-3 text-center">
                    <div className={`w-8 h-2 rounded-full mx-auto mb-2 ${diffColors[d.level] || "bg-ox-muted"}`} />
                    <span className={`font-mono tabular-nums text-xl font-bold ${diffTextColors[d.level] || "text-ox-ink"}`}>{d.count}</span>
                    <p className="text-xs text-ox-muted capitalize mt-0.5">{d.level}</p>
                    <p className="text-[10px] text-ox-muted">{d.pct}%</p>
                  </div>
                ))}
              </div>
              {/* Stacked bar */}
              <div className="h-4 rounded-full overflow-hidden flex border border-ox-edge">
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
        <div className="bg-ox-surface border border-ox-edge rounded-xl p-4 sm:p-6">
          <SectionHeader icon={Briefcase} title="Employment Types" subtitle="Offer type distribution" />
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
