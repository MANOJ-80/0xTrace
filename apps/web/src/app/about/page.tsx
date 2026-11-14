import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import TeamAvatar from "@/components/TeamAvatar";

export const metadata = {
  title: "About 0xTrace",
  description: "Learn how 0xTrace organizes campus interview experiences and preserves the candidate's original account.",
  openGraph: {
    title: "About 0xTrace | Campus Interview Intelligence",
    description: "Learn how 0xTrace organizes campus interview experiences and preserves the candidate's original account.",
    siteName: "0xTrace",
  },
  twitter: {
    card: "summary_large_image",
    title: "About 0xTrace | Campus Interview Intelligence",
    description: "Learn how 0xTrace organizes campus interview experiences and preserves the candidate's original account.",
  },
};

const features = [
  { title: "Interview directory", text: "Browse candidate accounts by company, role, outcome, and round." },
  { title: "Question bank", text: "Search questions and coding problems gathered from interview experiences." },
  { title: "Original writeups", text: "Compare structured round summaries with the candidate's source account." },
  { title: "Placement analytics", text: "Review company activity, round patterns, and question topics in the archive." },
];

const faqs = [
  {
    question: "Who can contribute to this platform?",
    answer: "Any student or senior who has gone through the campus placement process can share an experience. Contributions require a PSG iTech account.",
  },
  {
    question: "Are questions word-for-word transcripts?",
    answer: "Candidates often recall and write questions from memory after interviews. They may describe the concepts discussed without matching the interviewer's exact wording.",
  },
  {
    question: "What should I do if a structured round contains a mistake?",
    answer: "Use the Original Writeup tab to compare it with the candidate's source account. Structured summaries can contain errors.",
  },
];

export default function AboutPage() {
  return (
    <div className="about-page">
      <header className="about-hero">
        <div>
          <div className="page-kicker">About the archive</div>
          <h1 className="page-title">Interview knowledge, passed forward.</h1>
          <p className="page-description">0xTrace brings campus placement experiences together so candidates can learn how interviews unfold across companies and roles.</p>
        </div>
      </header>

      <section className="about-disclaimer" aria-labelledby="disclaimer-title">
        <div className="disclaimer-content">
          <div className="page-kicker">Before you use the archive</div>
          <h2 id="disclaimer-title">Candidate accounts are useful context, not guarantees.</h2>
          <ul>
            <li><strong>Educational use.</strong> The archive helps students prepare for campus placements.</li>
            <li><strong>Summaries can contain mistakes.</strong> AI helps structure some accounts into rounds and questions. The Original Writeup remains the source for each experience.</li>
            <li><strong>Experiences are self-reported.</strong> 0xTrace does not guarantee the accuracy or completeness of candidate submissions.</li>
          </ul>
        </div>
      </section>

      <section className="about-section" aria-labelledby="features-title">
        <div className="about-section-heading">
          <div className="page-kicker">What you can do</div>
          <h2 id="features-title">A practical guide to past interviews.</h2>
        </div>
        <div className="about-feature-grid">
          {features.map(({ title, text }) => (
            <article className="about-feature" key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-section about-faq" aria-labelledby="faq-title">
        <div className="about-section-heading">
          <div className="page-kicker">Common questions</div>
          <h2 id="faq-title">Using the archive</h2>
        </div>
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <details className="faq-item" key={faq.question} open={index === 0}>
              <summary>{faq.question}<span aria-hidden="true">+</span></summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="about-feedback" aria-labelledby="feedback-title">
        <div>
          <div className="page-kicker">Help improve 0xTrace</div>
          <h2 id="feedback-title">Found a bug or have an idea?</h2>
          <p>Report a problem, suggest a feature, or share another improvement on GitHub.</p>
        </div>
        <a
          href="https://github.com/MANOJ-80/0xTrace/issues/new/choose"
          target="_blank"
          rel="noreferrer"
          className="ui-action-secondary"
        >
          Create a GitHub issue <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </section>

      <section className="about-cta">
        <div>
          <div className="page-kicker">Pass it forward</div>
          <h2>Share what you learned.</h2>
          <p>Your interview account can help another candidate prepare.</p>
        </div>
        <Link href="/contribute" className="ui-action-primary">Share your experience <ArrowRight size={16} /></Link>
      </section>

      <section className="about-team" aria-labelledby="team-title">
        <div className="about-section-heading">
          <div className="page-kicker">Built by</div>
          <h2 id="team-title">Built by students, for students.</h2>
        </div>
        <p className="about-team-intro">
          We built 0xTrace to collect campus interview experiences in one place.
        </p>
        <div className="about-team-list">
          <article className="about-team-member">
            <TeamAvatar />
            <div className="about-team-copy">
              <h3>Manoj Ganesan</h3>
              <p className="about-team-role">
                Creator · Engineering and moderation
              </p>
              <p className="about-team-contribution">
                Built the archive, submission flow, and moderation tools.
              </p>
              <a
                href="https://manojganesan.vercel.app/?ref=0xtrace"
                target="_blank"
                rel="noreferrer"
                className="about-team-link"
              >
                Portfolio <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            </div>
          </article>
        </div>
        <p className="about-team-note">
          Feedback and contributions are welcome. Reach us through the profiles
          above, or{" "}
          <a
            href="https://github.com/MANOJ-80/0xTrace/issues/new/choose"
            target="_blank"
            rel="noreferrer"
          >
            open an issue on GitHub
          </a>
          .
        </p>
      </section>
    </div>
  );
}
