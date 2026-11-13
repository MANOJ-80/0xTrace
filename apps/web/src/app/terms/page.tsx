import Link from "next/link";

export const metadata = {
  title: "Terms",
  description:
    "The rules for reading and contributing to the 0xTrace campus interview archive.",
  openGraph: {
    title: "Terms | 0xTrace",
    description:
      "The rules for reading and contributing to the 0xTrace campus interview archive.",
    siteName: "0xTrace",
  },
};

const LAST_UPDATED = "13 November 2026";

export default function TermsPage() {
  return (
    <article className="legal-page">
      <header>
        <div className="page-kicker">Terms of use</div>
        <h1 className="page-title">Read carefully, contribute honestly.</h1>
        <p className="page-description">
          Last updated {LAST_UPDATED}. By using 0xTrace you agree to these terms.
        </p>
      </header>

      <section>
        <h2>Purpose</h2>
        <p>
          0xTrace is a student-run archive of campus placement interview
          experiences. It exists to help candidates prepare. It is not affiliated
          with PSG iTech, any recruiter, or any placement cell.
        </p>
      </section>

      <section>
        <h2>Accuracy</h2>
        <p>
          Experiences are self-reported and may be incomplete or mistaken. Some
          records are structured with AI assistance and can contain errors. The
          original writeup is the closest record of what the candidate submitted.
          Nothing here is a guarantee of an interview process, a question, or an
          outcome.
        </p>
      </section>

      <section>
        <h2>Contributions</h2>
        <ul>
          <li>
            Submit only experiences you personally had, or experiences you have
            explicit permission to share.
          </li>
          <li>
            Do not include confidential recruiter material, assessment papers marked
            confidential, personal contact details of interviewers, or anyone
            else&apos;s private information.
          </li>
          <li>
            Do not post content that is unlawful, harassing, defamatory, or that you
            do not have the right to publish.
          </li>
          <li>
            New submissions are reviewed before publication. We may edit, reject, or
            remove a submission that breaks these rules.
          </li>
        </ul>
      </section>

      <section>
        <h2>Your content</h2>
        <p>
          You keep ownership of what you write. By submitting, you grant 0xTrace a
          non-exclusive licence to store, format, and display the content in the
          archive. You can edit or delete your record at any time from{" "}
          <Link href="/my-experiences">My Experiences</Link>.
        </p>
      </section>

      <section>
        <h2>Acceptable use</h2>
        <ul>
          <li>Do not scrape, bulk-download, or resell the archive.</li>
          <li>Do not attempt to access records you are not permitted to view.</li>
          <li>Do not probe, overload, or disrupt the service.</li>
        </ul>
      </section>

      <section>
        <h2>Removal requests</h2>
        <p>
          If a record identifies you without your consent, use the{" "}
          <Link href="/contact">removal request form</Link>. We will review the
          request and remove or anonymise the record where appropriate.
        </p>
      </section>

      <section>
        <h2>No warranty</h2>
        <p>
          The service is provided as-is, without warranties of any kind. To the
          extent permitted by law, 0xTrace and its maintainers are not liable for
          decisions made using the archive or for any loss arising from its use.
        </p>
      </section>

      <section>
        <h2>Changes</h2>
        <p>
          These terms may change as the project evolves. The date at the top of this
          page shows the latest revision. Continued use after a change means you
          accept the revised terms.
        </p>
      </section>
    </article>
  );
}
