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
    <div className="flex items-center gap-2 sm:gap-3 group">
      <span
        className="w-24 sm:w-40 text-[11px] sm:text-sm text-ox-muted truncate group-hover:text-ox-ink transition-colors flex-shrink-0"
        title={label}
      >
        {label}
      </span>
      <div className="flex-1 h-5 sm:h-6 bg-ox-void rounded overflow-hidden border border-ox-edge min-w-0">
        {sub ? (
          sub
        ) : (
          <div
            className={`h-full ${color} rounded-sm transition-all duration-300`}
            style={{ width: `${Math.max(pct, 2)}%` }}
          />
        )}
      </div>
      <span className="w-7 sm:w-8 text-[11px] sm:text-xs font-mono text-ox-ink text-right tabular-nums flex-shrink-0">
        {value}
      </span>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-2.5 pb-3 border-b border-ox-edge mb-4">
      <div className="p-1.5 rounded-lg bg-ox-accent/10 border border-ox-accent/30 flex-shrink-0">
        <Icon className="w-4 h-4 text-ox-accent" />
      </div>
      <div className="min-w-0">
        <h2 className="text-sm sm:text-base font-bold text-ox-ink leading-tight truncate">{title}</h2>
        {subtitle && <p className="text-[11px] sm:text-xs text-ox-muted truncate mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number | string; icon: React.ElementType }) {
  return (
    <div className="flex flex-col items-center p-3 sm:p-4 bg-ox-surface border border-ox-edge rounded-xl hover:border-ox-accent/40 transition-colors">
      <Icon className="w-4 h-4 text-ox-muted mb-1" />
      <span className="font-mono tabular-nums text-xl sm:text-2xl lg:text-3xl font-bold text-ox-ink leading-tight">{value}</span>
      <span className="text-[10px] sm:text-xs text-ox-muted mt-1 text-center font-medium">{label}</span>
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
    selected: { bg: "bg-green-950/20", border: "border-green-600/40", text: "text-green-400", icon: CheckCircle2 },
    rejected: { bg: "bg-red-950/20", border: "border-red-600/40", text: "text-red-400", icon: XCircle },
    other: { bg: "bg-amber-950/20", border: "border-amber-600/40", text: "text-amber-400", icon: HelpCircle },
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
    <div className="space-y-6 sm:space-y-8">
      {/* ---- Stats Strip: 2-col on mobile, 3-col on sm, 6-col on lg ---- */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        <StatCard label="Experiences" value={totals.experiences} icon={Users} />
        <StatCard label="Companies" value={totals.companies} icon={Building2} />
        <StatCard label="Rounds" value={totals.rounds} icon={ListChecks} />
        <StatCard label="Questions" value={totals.questions} icon={MessageSquare} />
        <StatCard label="Coding Tasks" value={totals.codingProblems} icon={Code2} />
        <StatCard label="Tips Shared" value={totals.tips} icon={Lightbulb} />
      </div>

      {/* ---- Outcome Cards ---- */}
      <div>
        <SectionHeader icon={TrendingUp} title="Outcome Distribution" subtitle="Selection rates across all experiences" />
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {outcomes.map((o) => {
            const style = outcomeColors[o.status] || outcomeColors.other;
            const Icon = style.icon;
            return (
              <div key={o.status} className={`${style.bg} border ${style.border} rounded-xl p-3 sm:p-5 flex flex-col items-center text-center gap-1`}>
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${style.text}`} />
                <span className={`font-mono tabular-nums text-lg sm:text-3xl font-bold ${style.text}`}>{o.count}</span>
                <span className="text-[11px] sm:text-xs text-ox-muted capitalize font-medium">{o.status === "other" ? "Other" : o.status}</span>
                <span className="text-[10px] sm:text-xs text-ox-muted font-mono">{o.pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ---- Company Leaderboard (full width) ---- */}
      <div className="bg-ox-surface border border-ox-edge rounded-xl p-4 sm:p-6 shadow-sm">
        <SectionHeader icon={Building2} title="Company Leaderboard" subtitle={`Top ${Math.min(15, companyBreakdown.length)} recruiters by experience count`} />
        <div className="space-y-2.5 sm:space-y-3">
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
        <div className="flex items-center gap-3 sm:gap-4 mt-4 pt-3 border-t border-ox-edge text-xs text-ox-muted flex-wrap">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-green-500/70 flex-shrink-0" /> Selected</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-500/70 flex-shrink-0" /> Rejected</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-ox-muted/30 flex-shrink-0" /> Other</span>
        </div>
      </div>

      {/* ---- Two-Column: Round Types + Question Topics ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Round Type Distribution */}
        <div className="bg-ox-surface border border-ox-edge rounded-xl p-4 sm:p-6 shadow-sm">
          <SectionHeader icon={ListChecks} title="Round Types" subtitle={`${totals.rounds} rounds across ${roundTypes.length} types`} />
          <div className="space-y-2 sm:space-y-2.5">
            {roundTypes.slice(0, 10).map((r) => (
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

        {/* Question Topic Frequency */}
        <div className="bg-ox-surface border border-ox-edge rounded-xl p-4 sm:p-6 shadow-sm">
          <SectionHeader icon={MessageSquare} title="Technical Question Topics" subtitle={`${totals.questions} questions categorized`} />
          <div className="space-y-2 sm:space-y-2.5">
            {questionTopics.slice(0, 10).map((t) => (
              <HBar
                key={t.topic}
                label={t.topic}
                value={t.count}
                max={maxTopic}
                color="bg-purple-500"
              />
            ))}
          </div>
        </div>
      </div>

      {/* ---- Two-Column: Difficulty + Employment Types ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Difficulty Breakdown */}
        <div className="bg-ox-surface border border-ox-edge rounded-xl p-4 sm:p-6 shadow-sm">
          <SectionHeader icon={Zap} title="Question Difficulty" subtitle="Categorized interview difficulty" />
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
            {difficulty.map((d) => (
              <div key={d.level} className="bg-ox-void border border-ox-edge rounded-lg p-3 text-center">
                <span className={`font-mono text-xl sm:text-2xl font-bold ${diffTextColors[d.level] || "text-ox-ink"}`}>
                  {d.count}
                </span>
                <span className="block text-xs text-ox-muted capitalize mt-0.5">{d.level}</span>
                <span className="text-[10px] text-ox-muted font-mono">{d.pct}%</span>
              </div>
            ))}
          </div>
          {/* Stacked bar */}
          <div className="h-4 bg-ox-void rounded overflow-hidden flex border border-ox-edge">
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

        {/* Employment Type Distribution */}
        <div className="bg-ox-surface border border-ox-edge rounded-xl p-4 sm:p-6 shadow-sm">
          <SectionHeader icon={Briefcase} title="Offer Types" subtitle="Full-time vs Internship breakdown" />
          <div className="space-y-2 sm:space-y-2.5">
            {employmentTypes.map((et) => {
              const maxET = employmentTypes[0]?.count || 1;
              return (
                <HBar
                  key={et.type}
                  label={et.label}
                  value={et.count}
                  max={maxET}
                  color="bg-amber-500"
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
