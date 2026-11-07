import Link from "next/link";
import { ArrowDown, ArrowRight, BookOpen, Building2, Check, Code2, Search, ShieldCheck } from "lucide-react";
import { getAllExperiences } from "@/lib/data";

export const revalidate = 3600;

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
          <div className="eyebrow"><span className="eyebrow-dot" /> Campus interview intelligence</div>
          <h1 id="hero-title">Know what the interview is <span>really like.</span></h1>
          <p className="hero-description">
            Prepare with real campus placement experiences, round-by-round questions, and candidate insights collected in one searchable library.
          </p>
          <div className="hero-actions">
            <Link href="/experiences" className="primary-cta">Browse interview experiences <ArrowRight size={17} /></Link>
          </div>
          <div className="hero-note"><ShieldCheck size={15} /> Questions preserved from candidate accounts</div>
        </div>

        <div className="hero-visual" aria-label="Preview of a 0xTrace interview experience">
          <div className="visual-grid" />
          <div className="preview-window">
            <div className="preview-topbar">
              <div className="window-dots"><i /><i /><i /></div>
              <span>EXPERIENCE / {featured?.id ?? "EXPLORE"}</span>
              <Search size={14} />
            </div>
            <div className="preview-content">
              <div className="preview-kicker">CAMPUS PLACEMENT · INTERVIEW RECORD</div>
              <div className="preview-heading-row">
                <div>
                  <h2>{featured?.company?.name ?? "Company experience"}</h2>
                  <p>{featured?.job?.role || "Software role"} <span>·</span> {featured?.timeline?.year ?? "Candidate account"}</p>
                </div>
                <span className="record-badge"><span /> CANONICAL RECORD</span>
              </div>
              <div className="round-list">
                {featuredRounds.length > 0 ? featuredRounds.map((round, index) => (
                  <div className="round-row" key={`${round.sequence}-${round.name}`}>
                    <div className="round-index">0{index + 1}</div>
                    <div className="round-main"><strong>{round.name}</strong><span>{round.type || "Interview"}</span></div>
                    <div className="round-count">{round.questions?.length ?? 0}<span> questions</span></div>
                    <ArrowRight size={15} className="round-arrow" />
                  </div>
                )) : (
                  <div className="round-row"><div className="round-index">01</div><div className="round-main"><strong>Technical interview</strong><span>Interview round</span></div><div className="round-count">Open<span> the library</span></div><ArrowRight size={15} className="round-arrow" /></div>
                )}
              </div>
              <div className="preview-footer"><span><Check size={14} /> Original account preserved</span><span>0xTRACE LIBRARY</span></div>
            </div>
          </div>
          <div className="visual-caption"><span className="caption-line" /> Real accounts. Structured for your next interview.</div>
        </div>
      </section>

      <section className="proof-strip" aria-label="Library size">
        <div className="proof-intro">A clearer picture of the process</div>
        <div className="proof-stat"><strong>{experiences.length.toLocaleString()}</strong><span>interview experiences</span></div>
        <div className="proof-stat"><strong>{companies.size.toLocaleString()}</strong><span>companies</span></div>
        <div className="proof-stat"><strong>{rounds.toLocaleString()}</strong><span>interview rounds</span></div>
        <div className="proof-stat"><strong>{questions.toLocaleString()}</strong><span>interview questions</span></div>
      </section>

      <section className="value-section" aria-labelledby="value-title">
        <div className="section-heading">
          <div className="eyebrow">Preparation with context</div>
          <h2 id="value-title">Go in knowing what to expect.</h2>
          <p>Job descriptions tell you the role. Candidate experiences show you how the process unfolds.</p>
        </div>
        <div className="value-grid">
          <article className="value-card">
            <div className="value-icon"><Building2 size={19} /></div>
            <div className="value-label">01 / COMPANY</div>
            <h3>See the process by company</h3>
            <p>Compare interview journeys, roles, and outcomes from campus placement drives.</p>
            <Link href="/experiences" className="text-link">Explore the directory <ArrowRight size={15} /></Link>
          </article>
          <article className="value-card">
            <div className="value-icon"><BookOpen size={19} /></div>
            <div className="value-label">02 / QUESTIONS</div>
            <h3>Practice questions from real rounds</h3>
            <p>Review technical and behavioral questions gathered from candidate accounts.</p>
            <Link href="/questions" className="text-link">Browse the question bank <ArrowRight size={15} /></Link>
          </article>
          <article className="value-card">
            <div className="value-icon"><Code2 size={19} /></div>
            <div className="value-label">03 / ROUND BY ROUND</div>
            <h3>Understand the full interview</h3>
            <p>Follow each experience through its rounds, coding problems, and candidate notes.</p>
            <Link href="/analytics" className="text-link">View hiring analytics <ArrowRight size={15} /></Link>
          </article>
        </div>
      </section>

      <section className="closing-cta">
        <div>
          <div className="eyebrow">Your next interview starts here</div>
          <h2>Prepare with the experience of others.</h2>
          <p>Find the company, role, and questions you want to understand.</p>
        </div>
        <Link href="/experiences" className="primary-cta">Explore experiences <ArrowRight size={17} /></Link>
      </section>
      <div className="landing-bottom"><span>Built for candidates navigating campus placements.</span><a href="#hero-title" aria-label="Back to top">Back to top <ArrowDown size={14} /></a></div>
    </div>
  );
}
