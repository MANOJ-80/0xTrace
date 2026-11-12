import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAllExperiences } from "@/lib/data";
import { normalizeCompanyKey } from "@/lib/company";
import HeroRecordCarousel, { type HeroRecord } from "@/components/HeroRecordCarousel";
import type { Experience } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const HERO_COMPANIES = [
  { key: "everstage", name: "Everstage", role: "Security Engineer" },
  { key: "aivar_innovations", name: "Aivar Innovations Private Limited", role: "AI Engineer" },
  { key: "caterpillar", name: "Caterpillar", role: "Software Engineer" },
  { key: "societe_generale", name: "Societe Generale", role: "Software Engineer" },
  { key: "hyperverge", name: "HyperVerge", role: "Software Engineer" },
];

function buildPlaceholder(name: string, key: string, role?: string): HeroRecord {
  return {
    id: `exp_${key}`,
    company: name,
    role: role ?? "Software Engineer",
    year: "2025",
    placeholder: true,
    rounds: [
      { name: "Round 1: Online Assessment", type: "online_assessment", questions: 0 },
      { name: "Round 2: Technical Interview", type: "technical_interview", questions: 0 },
      { name: "Round 3: HR Interview", type: "hr_interview", questions: 0 },
    ],
  };
}

function toHeroRecord(experience: Experience, name: string, role?: string): HeroRecord {
  return {
    id: experience.id,
    company: name,
    role: role || experience.job?.role || "Role not specified",
    year: String(experience.timeline?.year ?? "Campus placement"),
    rounds: (experience.rounds ?? []).slice(0, 3).map((round) => ({
      name: round.name,
      type: round.type || "Interview",
      questions: round.questions?.length ?? 0,
    })),
  };
}

function scoreExperience(experience: Experience) {
  const rounds = experience.rounds ?? [];
  const questionCount = rounds.reduce((total, round) => total + (round.questions?.length ?? 0), 0);
  return questionCount * 10 + rounds.length;
}

function pickHeroRecords(experiences: Experience[]): HeroRecord[] {
  return HERO_COMPANIES.map(({ key, name, role }) => {
    const matches = experiences.filter((experience) => {
      const normalized = normalizeCompanyKey(experience.company?.name);
      return normalized === key || normalized.startsWith(`${key}_`);
    });
    const [best] = [...matches].sort((a, b) => scoreExperience(b) - scoreExperience(a));

    if (best) return toHeroRecord(best, name, role);
    return buildPlaceholder(name, key, role);
  });
}

export default async function HomePage() {
  const experiences = await getAllExperiences();
  const companies = new Set(experiences.map((experience) => experience.company?.name).filter(Boolean));
  const rounds = experiences.reduce((total, experience) => total + (experience.rounds?.length ?? 0), 0);
  const questions = experiences.reduce(
    (total, experience) => total + (experience.rounds ?? []).reduce((roundTotal, round) => roundTotal + (round.questions?.length ?? 0), 0),
    0,
  );
  const heroRecords = pickHeroRecords(experiences);

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

        <div className="hero-visual">
          <HeroRecordCarousel records={heroRecords} />
        </div>
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
