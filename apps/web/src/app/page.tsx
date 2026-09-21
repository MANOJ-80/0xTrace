import Link from "next/link";
import { getDashboardMetrics, getAllExperiences } from "@/lib/data";
import ExperienceCard from "@/components/ExperienceCard";
import {
  Building2,
  HelpCircle,
  Code2,
  Compass,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  Sparkles,
  GitCommit,
  CheckCircle2,
} from "lucide-react";

export const revalidate = 3600; // Cache for 1 hour

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics();
  const allExperiences = await getAllExperiences();
  const recentExperiences = allExperiences.slice(0, 6);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 p-8 sm:p-12 text-white border border-indigo-500/20 shadow-xl shadow-indigo-950/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>0xTrace Placement Intelligence</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Evidence-First Campus Interview Intelligence
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Derived directly from <strong>126 audited college placement experiences</strong>. Zero hallucinated rounds, exact questions asked, real coding problem statements, and lossless verbatim source preservation.
          </p>

          <div className="pt-3 flex flex-wrap items-center gap-3">
            <Link
              href="/experiences"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              <Compass className="w-4 h-4" />
              <span>Explore All Experiences</span>
            </Link>

            <Link
              href="/questions"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-all"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Question Bank ({metrics.totalQuestions})</span>
            </Link>

            <Link
              href="/upload"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition-all"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>PDF Extraction Studio</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Experiences</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            {metrics.totalExperiences}
          </div>
          <p className="text-xs text-slate-500 mt-1">Audited campus drives</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Interview Rounds</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <GitCommit className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            {metrics.totalRounds}
          </div>
          <p className="text-xs text-slate-500 mt-1">OA, Technical & HR stages</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Questions Bank</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            {metrics.totalQuestions}
          </div>
          <p className="text-xs text-slate-500 mt-1">DSA, DBMS, OS, Systems</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Coding Problems</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Code2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            {metrics.totalCodingProblems}
          </div>
          <p className="text-xs text-slate-500 mt-1">Real assessment challenges</p>
        </div>
      </div>

      {/* Company Intelligence Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Company Interview Intelligence
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Aggregated interview patterns across {metrics.totalCompanies} recruiting companies
            </p>
          </div>
          <Link
            href="/experiences"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>View All Companies</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.topCompanies.map((comp) => {
            const selectRate =
              comp.experienceCount > 0
                ? Math.round((comp.selectedCount / comp.experienceCount) * 100)
                : 0;

            return (
              <Link
                key={comp.name}
                href={`/experiences?company=${encodeURIComponent(comp.name)}`}
                className="group p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-sm border border-indigo-100 dark:border-indigo-900">
                    {comp.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {comp.experienceCount} {comp.experienceCount === 1 ? "Experience" : "Experiences"}
                  </span>
                </div>

                <div className="mt-3">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {comp.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                    {comp.roles.slice(0, 2).join(", ") || "Engineering Roles"}
                  </p>
                </div>

                {/* Common Round Flow */}
                {comp.roundSequenceSample && comp.roundSequenceSample.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Typical Flow ({comp.totalRounds / comp.experienceCount} avg rounds)
                    </span>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1 font-mono truncate">
                      {comp.roundSequenceSample.slice(0, 3).map((r, i) => (
                        <span key={i} className="flex items-center gap-1">
                          <span>{r.split("-")[0].trim()}</span>
                          {i < Math.min(comp.roundSequenceSample.length, 3) - 1 && <span>→</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Featured / Recent Experiences */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Audited Experience Traces
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Browse detailed interview breakdowns with questions and verbatim notes
            </p>
          </div>
          <Link
            href="/experiences"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>Explore All {allExperiences.length}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {recentExperiences.map((exp) => (
            <ExperienceCard key={exp.id} experience={exp} />
          ))}
        </div>
      </div>
    </div>
  );
}
