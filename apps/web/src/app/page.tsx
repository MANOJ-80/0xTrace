import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAllExperiences } from "@/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const experiences = await getAllExperiences();
  const companies = new Set(experiences.map((experience) => experience.company?.name).filter(Boolean));
  const rounds = experiences.reduce((total, experience) => total + (experience.rounds?.length ?? 0), 0);
  const questions = experiences.reduce(
    (total, experience) => total + (experience.rounds ?? []).reduce((roundTotal, round) => roundTotal + (round.questions?.length ?? 0), 0),
    0,
  );
  const featured = experiences[0];
  const featuredRounds = (featured?.rounds ?? []).slice(0, 3);

  return (
    <div className="landing-page">
      <section className="landing-hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">Campus placement interview archive</p>
          <h1 id="hero-title">See how campus interviews unfold, <span>round by round.</span></h1>
          <p className="hero-description">
            Browse candidate accounts by company and role. Follow the reported questions through each round, with the original writeup kept alongside.
          </p>
          <div className="hero-actions">
            <Link href="/experiences" className="primary-cta">Browse interview experiences <ArrowRight size={16} /></Link>
          </div>
          <p className="hero-note">Accounts are candidate-reported and may not reflect every interview.</p>
        </div>

        {featured && (
          <figure className="hero-visual" aria-label={`Example interview record for ${featured.company?.name ?? "a campus placement"}`}>
            <div className="record-preview">
              <div className="record-topline">
                <span>Candidate account · {featured.timeline?.year ?? "Campus placement"}</span>
                <span className="font-mono">{featured.id}</span>
              </div>
              <div className="preview-content">
                <p className="preview-kicker">Interview record</p>
                <div className="preview-heading-row">
                  <div>
                    <h2>{featured.company?.name ?? "Company experience"}</h2>
                    <p>{featured.job?.role || "Role not specified"}</p>
                  </div>
                  <span className="record-badge">Candidate-reported</span>
                </div>
                <div className="round-list">
                  {featuredRounds.map((round, index) => (
                    <div className="round-row" key={`${round.sequence}-${round.name}`}>
                      <span className="round-index">{String(index + 1).padStart(2, "0")}</span>
                      <span className="round-main">
                        <strong>{round.name}</strong>
                        <span>{(round.type || "Interview").replace(/_/g, " ")}</span>
                      </span>
                      <span className="round-count">{round.questions?.length ?? 0}<span> questions</span></span>
                    </div>
                  ))}
                </div>
                <p className="preview-footer">Original writeup available with the full record</p>
              </div>
            </div>
          </figure>
        )}
      </section>

      <section className="proof-strip" aria-label="Archive contents">
        <div className="proof-intro">In the archive</div>
        <div className="proof-stat"><strong>{experiences.length.toLocaleString()}</strong><span>candidate accounts</span></div>
        <div className="proof-stat"><strong>{companies.size.toLocaleString()}</strong><span>companies</span></div>
        <div className="proof-stat"><strong>{rounds.toLocaleString()}</strong><span>interview rounds</span></div>
        <div className="proof-stat"><strong>{questions.toLocaleString()}</strong><span>reported questions</span></div>
      </section>

      <section className="value-section" aria-labelledby="value-title">
        <div className="section-heading">
          <p className="eyebrow">Browse by what you need</p>
          <h2 id="value-title">Start with the company, the question, or the process.</h2>
          <p>Each part of the archive answers a different preparation question.</p>
        </div>
        <div className="feature-list">
          <Link href="/experiences" className="feature-row">
            <h3>Interview experiences</h3>
            <p>Compare candidate accounts by company, role, outcome, and interview round.</p>
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link href="/questions" className="feature-row">
            <h3>Questions from real rounds</h3>
            <p>Find technical and behavioral questions candidates reported after interviews.</p>
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link href="/analytics" className="feature-row">
            <h3>Placement patterns</h3>
            <p>Review company activity, round types, outcomes, and question topics in the archive.</p>
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="closing-cta" aria-labelledby="contribute-title">
        <div>
          <p className="eyebrow">Add to the archive</p>
          <h2 id="contribute-title">Share what your interview was like.</h2>
          <p>Your account can give the next candidate a clearer view of the process.</p>
        </div>
        <Link href="/contribute" className="ui-action-secondary">Share your experience <ArrowRight size={16} /></Link>
      </section>
      <div className="landing-bottom"><span>For candidates preparing for campus placements.</span><a href="#hero-title" aria-label="Back to top">Back to top <ArrowRight size={14} /></a></div>
    </div>
  );
}
