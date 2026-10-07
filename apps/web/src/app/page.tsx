import Link from "next/link";
import { getDashboardMetrics, getAllExperiences } from "@/lib/data";
import ExperienceCard from "@/components/ExperienceCard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics();
  const allExperiences = await getAllExperiences();
  const recentExperiences = allExperiences.slice(0, 6);

  return (
    <div className="space-y-16">
      {/* Stats Strip */}
      <div className="flex flex-wrap items-center gap-x-8 gap-y-6 border-b border-ox-edge pb-8">
        <div>
          <div className="font-mono tabular-nums text-3xl sm:text-4xl text-ox-ink leading-tight">{metrics.totalExperiences}</div>
          <div className="text-sm text-ox-muted mt-1">Experiences</div>
        </div>
        <div className="w-px h-12 bg-ox-edge hidden sm:block"></div>
        <div>
          <div className="font-mono tabular-nums text-3xl sm:text-4xl text-ox-ink leading-tight">{metrics.totalRounds}</div>
          <div className="text-sm text-ox-muted mt-1">Rounds</div>
        </div>
        <div className="w-px h-12 bg-ox-edge hidden sm:block"></div>
        <div>
          <div className="font-mono tabular-nums text-3xl sm:text-4xl text-ox-ink leading-tight">{metrics.totalQuestions}</div>
          <div className="text-sm text-ox-muted mt-1">Questions</div>
        </div>
        <div className="w-px h-12 bg-ox-edge hidden sm:block"></div>
        <div>
          <div className="font-mono tabular-nums text-3xl sm:text-4xl text-ox-ink leading-tight">{metrics.totalCodingProblems}</div>
          <div className="text-sm text-ox-muted mt-1">Coding Problems</div>
        </div>
      </div>

      {/* Company Intelligence Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl text-ox-ink font-geist">Company intelligence</h2>
          <Link
            href="/experiences"
            className="text-sm text-ox-accent hover:underline flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ox-accent rounded-sm"
          >
            View all
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.topCompanies.map((comp) => (
            <Link
              key={comp.name}
              href={`/experiences?company=${encodeURIComponent(comp.name)}`}
              className="block p-4 bg-ox-surface border border-ox-edge rounded-lg hover:border-ox-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ox-accent"
            >
              <div className="flex items-start justify-between">
                <h3 className="font-bold text-ox-ink">{comp.name}</h3>
                <span className="text-xs text-ox-muted">
                  {comp.experienceCount} {comp.experienceCount === 1 ? "exp" : "exps"}
                </span>
              </div>
              
              {comp.roundSequenceSample && comp.roundSequenceSample.length > 0 && (
                <div className="mt-4">
                  <div className="text-xs text-ox-muted font-mono truncate">
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
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl text-ox-ink font-geist">Recent experiences</h2>
          <Link
            href="/experiences"
            className="text-sm text-ox-accent hover:underline flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ox-accent rounded-sm"
          >
            All {allExperiences.length}
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentExperiences.map((exp) => (
            <ExperienceCard key={exp._id || exp.id} experience={exp} />
          ))}
        </div>
      </section>
    </div>
  );
}
