import ManualEntryForm from "@/components/ManualEntryForm";
import { PenLine } from "lucide-react";

export const metadata = {
  title: "Contribute — 0xTrace",
  description: "Share your interview experience to help future candidates.",
};

export default function ContributePage() {
  return (
    <main className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="text-center space-y-3 mb-10">
        <div className="mx-auto w-12 h-12 rounded-full bg-ox-accent/10 border-2 border-ox-accent flex items-center justify-center">
          <PenLine className="w-5 h-5 text-ox-accent" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-ox-ink">
          Share Your Experience
        </h1>
        <p className="text-sm text-ox-muted max-w-lg mx-auto">
          Help future candidates by sharing your interview experience.
          Fill out the form below and your experience will be published to the database.
        </p>
      </div>

      <ManualEntryForm />
    </main>
  );
}
