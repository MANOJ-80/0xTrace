import ManualEntryForm from "@/components/ManualEntryForm";
import { PenLine } from "lucide-react";

export const metadata = {
  title: "Contribute — 0xTrace",
  description: "Share your interview experience to help future candidates.",
};

export default function ContributePage() {
  return (
    <div className="space-y-7">
      <header className="page-heading">
        <div className="page-heading-copy">
          <div className="page-kicker">Community contribution</div>
          <h1 className="page-title">Share your interview experience</h1>
          <p className="page-description">
            Add your company, interview rounds, and the advice you would pass on to the next candidate.
          </p>
        </div>
        <div className="page-heading-icon"><PenLine className="w-5 h-5 text-ox-accent" /></div>
      </header>

      <ManualEntryForm />
    </div>
  );
}
