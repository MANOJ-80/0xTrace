import Link from "next/link";
import { getDashboardMetrics, getAllExperiences } from "@/lib/data";
import ExperienceCard from "@/components/ExperienceCard";
import { ArrowRight, Sparkles, Building2, BookOpen } from "lucide-react";

export const revalidate = 3600;

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics();
  const allExperiences = await getAllExperiences();
  const recentExperiences = allExperiences.slice(0, 6);

  return (
    <div className="space-y-10 sm:space-y-14">
      {/* Hero / Header banner for mobile */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ox-accent/10 border border-ox-accent/30 text-ox-accent text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>PSG iTech & Tech Placement Archive</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-ox-ink font-geist">
          Campus Interview Intelligence
        </h1>
        <p className="text-sm sm:text-base text-ox-muted max-w-2xl leading-relaxed">
          126 audited placement experiences with verbatim questions, round breakdowns, and lossless source preservation.
        </p>
      </div>

      {/* Stats Strip — 2x2 grid on mobile, 4-col on sm/desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 border-y border-ox-edge py-6 sm:py-8 bg-ox-surface/30 rounded-xl px-4 sm:px-6">
        <div className="space-y-1">
          <div className="font-mono tabular-nums text-2xl sm:text-4xl font-bold text-ox-ink leading-tight">
            {metrics.totalExperiences}
          </div>
          <div className="text-xs sm:text-sm text-ox-muted font-medium">Experiences</div>
        </div>

        <div className="space-y-1 border-l border-ox-edge/60 pl-3 sm:pl-6">
          <div className="font-mono tabular-nums text-2xl sm:text-4xl font-bold text-ox-ink leading-tight">
            {metrics.totalRounds}
          </div>
          <div className="text-xs sm:text-sm text-ox-muted font-medium">Rounds</div>
        </div>

        <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-ox-edge/60 pt-3 sm:pt-0 sm:pl-6">
          <div className="font-mono tabular-nums text-2xl sm:text-4xl font-bold text-ox-ink leading-tight">
            {metrics.totalQuestions}
          </div>
          <div className="text-xs sm:text-sm text-ox-muted font-medium">Questions</div>
        </div>

        <div className="space-y-1 border-t sm:border-t-0 border-l border-ox-edge/60 pt-3 sm:pt-0 pl-3 sm:pl-6">
          <div className="font-mono tabular-nums text-2xl sm:text-4xl font-bold text-ox-ink leading-tight">
            {metrics.totalCodingProblems}
          </div>
          <div className="text-xs sm:text-sm text-ox-muted font-medium">Coding Problems</div>
        </div>
      </div>

      {/* Company Intelligence Grid */}
      <section className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-ox-accent shrink-0" />
            <h2 className="text-lg sm:text-xl font-bold text-ox-ink font-geist">
              Company Intelligence
            </h2>
          </div>
          <Link
            href="/experiences"
            className="text-xs sm:text-sm font-semibold text-ox-accent hover:underline flex items-center gap-1 px-2.5 py-1.5 rounded-md hover:bg-ox-accent/10 transition-colors min-h-[36px]"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {metrics.topCompanies.map((comp) => (
            <Link
              key={comp.name}
              href={`/experiences?company=${encodeURIComponent(comp.name)}`}
              className="block p-4 sm:p-5 bg-ox-surface border border-ox-edge rounded-xl hover:border-ox-accent active:scale-[0.99] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ox-accent group"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-sm sm:text-base text-ox-ink group-hover:text-ox-accent transition-colors truncate">
                  {comp.name}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-ox-surface-raised border border-ox-edge text-ox-muted font-mono shrink-0">
                  {comp.experienceCount} {comp.experienceCount === 1 ? "exp" : "exps"}
                </span>
              </div>
              
              {comp.roundSequenceSample && comp.roundSequenceSample.length > 0 && (
                <div className="mt-3 pt-3 border-t border-ox-edge/50">
                  <div className="text-[11px] sm:text-xs text-ox-muted font-mono truncate">
                    {comp.roundSequenceSample.slice(0, 3).map((r, i) => (
                      <span key={i}>
                        {r.split("-")[0].trim()}
                        {i < Math.min(comp.roundSequenceSample.length, 3) - 1 && " → "}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Experiences */}
      <section className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-ox-accent shrink-0" />
            <h2 className="text-lg sm:text-xl font-bold text-ox-ink font-geist">
              Recent Experiences
            </h2>
          </div>
          <Link
            href="/experiences"
            className="text-xs sm:text-sm font-semibold text-ox-accent hover:underline flex items-center gap-1 px-2.5 py-1.5 rounded-md hover:bg-ox-accent/10 transition-colors min-h-[36px]"
          >
            <span>All {allExperiences.length}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {recentExperiences.map((exp) => (
            <ExperienceCard key={exp._id || exp.id} experience={exp} />
          ))}
        </div>
      </section>
    </div>
  );
}
