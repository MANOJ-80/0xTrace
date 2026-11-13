import Link from "next/link";

export const metadata = {
  title: "Privacy",
  description:
    "What 0xTrace stores, what it shows publicly, and how to have your record corrected or removed.",
  openGraph: {
    title: "Privacy | 0xTrace",
    description:
      "What 0xTrace stores, what it shows publicly, and how to have your record corrected or removed.",
    siteName: "0xTrace",
  },
};

const LAST_UPDATED = "13 November 2026";

export default function PrivacyPage() {
  return (
    <article className="legal-page">
      <header>
        <div className="page-kicker">Privacy</div>
        <h1 className="page-title">Your data, and what the archive shows.</h1>
        <p className="page-description">
          Last updated {LAST_UPDATED}. This page explains what 0xTrace stores, what
          an anonymous visitor can see, and how to have a record corrected or removed.
        </p>
      </header>

      <section>
        <h2>Who can use 0xTrace</h2>
        <p>
          Sign-in is restricted to <strong>@psgitech.ac.in</strong> accounts through
          Google OAuth. We receive your name, email address, and profile image from
          Google. We use the email address to identify your account, to decide
          whether you are an administrator, and to associate submissions with you.
        </p>
      </section>

      <section>
        <h2>What we store</h2>
        <ul>
          <li>Your Google name, email address, and profile image.</li>
          <li>
            The interview experience you submit: company, role, timeline, rounds,
            questions, outcome, and any advice you choose to add.
          </li>
          <li>
            Contact details you choose to enter, such as a LinkedIn URL. These are
            never shown to anonymous visitors.
          </li>
          <li>
            Operational records: timestamps, moderation status, and an activity log
            of edits and deletions made by authors and administrators.
          </li>
        </ul>
      </section>

      <section>
        <h2>What anonymous visitors can see</h2>
        <p>
          The public directory shows a summary card: company, role, year, outcome,
          round count, and a shortened candidate name. The shortened name is your
          first name plus the initial of your last name, for example <em>Ananya R.</em>
        </p>
        <p>
          The full writeup, contact details, email address, and raw source text are
          available only to signed-in users, the author, and administrators. Search
          engine crawlers are blocked from record pages.
        </p>
      </section>

      <section>
        <h2>Moderation</h2>
        <p>
          New submissions are marked <strong>pending</strong> and stay out of the
          public archive until a moderator approves them. A moderator can reject a
          submission. Pending and rejected records are visible only to their author
          and to administrators.
        </p>
      </section>

      <section>
        <h2>How long we keep data</h2>
        <p>
          Records stay in the archive until you delete them or ask us to remove them.
          Deleting your record removes it from the live database. Backup copies may
          persist for a short period before they are overwritten.
        </p>
      </section>

      <section>
        <h2>Your choices</h2>
        <ul>
          <li>
            <strong>Edit.</strong> Signed-in authors can edit their own record from{" "}
            <Link href="/my-experiences">My Experiences</Link>.
          </li>
          <li>
            <strong>Delete.</strong> Authors can delete their own record from the same
            page. Deletion is immediate.
          </li>
          <li>
            <strong>Remove someone else&apos;s record.</strong> If a record identifies
            you and you did not consent to it, use the{" "}
            <Link href="/contact">removal request form</Link>. Include the record URL
            and the details you want removed.
          </li>
        </ul>
      </section>

      <section>
        <h2>Cookies and third parties</h2>
        <p>
          0xTrace uses a session cookie to keep you signed in. Google OAuth sets its
          own cookies during sign-in. We do not run advertising trackers or
          third-party analytics.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Questions about this policy or a data request can be sent through the{" "}
          <Link href="/contact">contact page</Link>.
        </p>
      </section>
    </article>
  );
}
