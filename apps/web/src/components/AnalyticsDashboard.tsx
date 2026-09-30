"use client";

import type { AnalyticsData } from "@/lib/data";
import {
  BarChart3,
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
  CalendarDays,
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
  suffix,
  sub,
}: {
  label: string;
  value: number;
  max: number;
  color?: string;
  suffix?: string;
  sub?: React.ReactNode;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3 group">
      <span className="w-36 sm:w-44 text-sm text-ox-muted truncate group-hover:text-ox-ink transition-colors" title={label}>
        {label}
      </span>
      <div className="flex-1 h-7 bg-ox-void rounded-md overflow-hidden border border-ox-edge">
        {sub ? (
          sub
        ) : (
          <div
            className={`h-full ${color} transition-all duration-500 rounded-sm`}
            style={{ width: `${Math.max(pct, 1.5)}%` }}
          />
        )}
      </div>
      <span className="w-12 text-sm font-mono text-ox-ink text-right tabular-nums">
        {value}{suffix}
      </span>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-2.5 pb-3 border-b border-ox-edge mb-5">
      <div className="p-1.5 rounded-md bg-ox-accent/10 border border-ox-accent/30">
        <Icon className="w-4 h-4 text-ox-accent" />
      </div>
      <div>
        <h2 className="text-base font-bold text-ox-ink leading-tight">{title}</h2>
        {subtitle && <p className="text-xs text-ox-muted">{subtitle}</p>}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number | string; icon: React.ElementType }) {
  return (
    <div className="flex flex-col items-center p-4 bg-ox-surface border border-ox-edge rounded-lg hover:border-ox-accent/40 transition-colors">
      <Icon className="w-4 h-4 text-ox-muted mb-2" />
      <span className="font-mono tabular-nums text-2xl sm:text-3xl text-ox-ink leading-tight">{value}</span>
      <span className="text-xs text-ox-muted mt-1">{label}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function AnalyticsDashboard({ data }: { data: AnalyticsData }) {
  const { totals, companyBreakdown, roundTypes, outcomes, questionTopics, difficulty, employmentTypes, seasonality } = data;

  const maxCompany = companyBreakdown[0]?.count || 1;
  const maxRoundType = roundTypes[0]?.count || 1;
  const maxTopic = questionTopics[0]?.count || 1;
  const maxSeasonality = Math.max(...seasonality.map((s) => s.count), 1);

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

  return (
    <div className="space-y-10">
      {/* ---- Stats Strip ---- */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {outcomes.map((o) => {
            const style = outcomeColors[o.status] || outcomeColors.other;
            const Icon = style.icon;
            return (
              <div key={o.status} className={`${style.bg} border ${style.border} rounded-xl p-5 flex flex-col items-center gap-2`}>
                <Icon className={`w-6 h-6 ${style.text}`} />
                <span className={`font-mono tabular-nums text-3xl font-bold ${style.text}`}>{o.count}</span>
                <span className="text-sm text-ox-muted capitalize">{o.status === "other" ? "Other / Completed" : o.status}</span>
                <span className="text-xs text-ox-muted">{o.pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ---- Two-Column Grid ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Company Leaderboard */}
        <div className="bg-ox-surface border border-ox-edge rounded-xl p-5 sm:p-6">
          <SectionHeader icon={Building2} title="Company Leaderboard" subtitle={`Top ${Math.min(15, companyBreakdown.length)} companies by experience count`} />
          <div className="space-y-2.5">
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
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-green-500/70" /> Selected</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-500/70" /> Rejected</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-ox-muted/30" /> Other</span>
          </div>
        </div>

        {/* Round Type Distribution */}
        <div className="bg-ox-surface border border-ox-edge rounded-xl p-5 sm:p-6">
          <SectionHeader icon={ListChecks} title="Round Types" subtitle={`${totals.rounds} rounds across ${roundTypes.length} types`} />
          <div className="space-y-2.5">
            {roundTypes.map((r) => (
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
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-ox-edge text-xs text-ox-muted">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-blue-500" /> Technical</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-purple-500" /> HR / Managerial</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-500" /> Assessment</span>
          </div>
        </div>
      </div>

      {/* ---- Second Row ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Question Topics */}
        <div className="bg-ox-surface border border-ox-edge rounded-xl p-5 sm:p-6">
          <SectionHeader icon={MessageSquare} title="Question Topics" subtitle={`Top ${Math.min(15, questionTopics.length)} most asked topics`} />
          <div className="space-y-2.5">
            {questionTopics.slice(0, 15).map((t) => (
              <HBar key={t.topic} label={t.topic} value={t.count} max={maxTopic} color="bg-cyan-500" />
            ))}
          </div>
        </div>

        {/* Difficulty + Employment + Seasonality */}
        <div className="space-y-8">
          {/* Difficulty */}
          <div className="bg-ox-surface border border-ox-edge rounded-xl p-5 sm:p-6">
            <SectionHeader icon={Zap} title="Round Difficulty" subtitle="Distribution of explicitly tagged rounds" />
            {difficulty.length > 0 ? (
              <>
                <div className="flex gap-3 mb-4">
                  {difficulty.map((d) => (
                    <div
                      key={d.level}
                      className="flex-1 rounded-lg border border-ox-edge p-3 text-center"
                      style={{ flex: d.pct }}
                    >
                      <div className={`w-full h-3 rounded-full mb-2 ${diffColors[d.level] || "bg-ox-muted"}`} />
                      <span className="font-mono tabular-nums text-lg font-bold text-ox-ink">{d.count}</span>
                      <p className="text-xs text-ox-muted capitalize">{d.level}</p>
                      <p className="text-xs text-ox-muted">{d.pct}%</p>
                    </div>
                  ))}
                </div>
                {/* Stacked bar */}
                <div className="h-5 rounded-full overflow-hidden flex border border-ox-edge">
                  {difficulty.map((d) => (
                    <div
                      key={d.level}
                      className={`h-full ${diffColors[d.level] || "bg-ox-muted"}`}
                      style={{ width: `${d.pct}%` }}
                      title={`${d.level}: ${d.count} (${d.pct}%)`}
                    />
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-ox-muted">No difficulty data tagged.</p>
            )}
          </div>

          {/* Employment Types */}
          <div className="bg-ox-surface border border-ox-edge rounded-xl p-5 sm:p-6">
            <SectionHeader icon={Briefcase} title="Employment Types" />
            <div className="grid grid-cols-2 gap-3">
              {employmentTypes.map((e) => (
                <div key={e.type} className="bg-ox-void border border-ox-edge rounded-lg p-3 text-center">
                  <span className="font-mono tabular-nums text-xl font-bold text-ox-ink">{e.count}</span>
                  <p className="text-xs text-ox-muted mt-1">{e.label}</p>
                  <p className="text-xs text-ox-muted">{e.pct}%</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ---- Seasonality ---- */}
      <div className="bg-ox-surface border border-ox-edge rounded-xl p-5 sm:p-6">
        <SectionHeader icon={CalendarDays} title="Hiring Seasonality" subtitle="When do campus placements happen?" />
        <div className="flex items-end gap-2 h-48">
          {seasonality.map((s) => {
            const h = maxSeasonality > 0 ? (s.count / maxSeasonality) * 100 : 0;
            return (
              <div key={s.month} className="flex-1 flex flex-col items-center gap-1 group">
                <span className="text-xs font-mono text-ox-muted opacity-0 group-hover:opacity-100 transition-opacity">
                  {s.count}
                </span>
                <div className="w-full flex-1 flex items-end">
                  <div
                    className="w-full bg-ox-accent/70 hover:bg-ox-accent rounded-t-md transition-all duration-300 border border-b-0 border-ox-accent/30"
                    style={{ height: `${Math.max(h, 3)}%` }}
                  />
                </div>
                <span className="text-xs text-ox-muted">{s.month}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
