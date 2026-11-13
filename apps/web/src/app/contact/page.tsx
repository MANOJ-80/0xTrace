import ContactForm from "@/components/ContactForm";
import { ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Contact",
  description:
    "Request removal or correction of a 0xTrace record, or report a problem.",
  openGraph: {
    title: "Contact | 0xTrace",
    description:
      "Request removal or correction of a 0xTrace record, or report a problem.",
    siteName: "0xTrace",
  },
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; record?: string }>;
}) {
  const params = await searchParams;
  const defaultType =
    params.type === "correction" || params.type === "bug"
      ? params.type
      : "removal";
  const record = params.record || "";

  return (
    <div className="mx-auto max-w-2xl space-y-7">
      <header>
        <div className="page-kicker">Contact</div>
        <h1 className="page-title">Removal, corrections, and reports.</h1>
        <p className="page-description">
          If a record identifies you and you did not agree to share it, say so here.
          Include the record link so it can be found quickly.
        </p>
      </header>

      <div className="flex items-start gap-3 rounded-lg border border-ox-edge bg-ox-surface p-4 text-sm text-ox-text">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-ox-accent" />
        <p>
          Removal requests are read by an administrator, not published. Requests
          about a live record are handled before routine corrections.
        </p>
      </div>

      <div className="rounded-lg border border-ox-edge bg-ox-surface p-5 sm:p-6">
        <ContactForm defaultType={defaultType} defaultRecordUrl={record} />
      </div>

      <p className="text-sm text-ox-text">
        Authors can edit or delete their own record directly from{" "}
        <a href="/my-experiences" className="text-ox-accent underline underline-offset-2">
          My Experiences
        </a>
        .
      </p>
    </div>
  );
}
