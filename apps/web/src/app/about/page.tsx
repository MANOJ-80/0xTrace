import { Info, ShieldAlert, Sparkles, HelpCircle, BookOpen, Search, BarChart3, FileText } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "About 0xTrace",
  description:
    "Learn about 0xTrace: A centralized campus interview intelligence archive preserving verified student experiences for PSG iTech.",
  openGraph: {
    title: "About 0xTrace | Campus Interview Intelligence",
    description:
      "Learn about 0xTrace: A centralized campus interview intelligence archive preserving verified student experiences for PSG iTech.",
    siteName: "0xTrace",
  },
  twitter: {
    card: "summary_large_image",
    title: "About 0xTrace | Campus Interview Intelligence",
    description:
      "Learn about 0xTrace: A centralized campus interview intelligence archive preserving verified student experiences for PSG iTech.",
  },
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-12">
      {/* Header */}
      <section className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-ox-surface-raised border-2 border-ox-edge rounded-2xl flex items-center justify-center shadow-neo">
          <Info className="w-8 h-8 text-ox-accent" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-ox-ink font-geist tracking-tight">
          About 0xTrace
        </h1>
        <p className="text-lg text-ox-muted max-w-2xl mx-auto leading-relaxed">
          A single, unified platform designed to centralize interview experiences shared by seniors across different companies and departments.
        </p>
      </section>

      {/* Guidelines & Disclaimers (Crucial) */}
      <section className="bg-ox-accent/10 border-2 border-ox-accent rounded-xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <ShieldAlert className="w-6 h-6 text-ox-accent" />
          <h2 className="text-xl font-bold text-ox-ink">Important Guidelines & Disclaimer</h2>
        </div>
        <ul className="space-y-4 text-ox-ink/90 leading-relaxed list-disc list-inside">
          <li>
            <strong>Educational Purpose Only:</strong> This platform is built strictly for educational purposes to help students prepare for their placements.
          </li>
          <li>
            <strong>AI Summarization & The Source of Truth:</strong> We use Artificial Intelligence to parse and summarize some of the content into structured rounds and questions. Because AI is not perfect, the <span className="font-semibold text-ox-accent">Original Writeup</span> tab is always preserved and remains the ultimate source of truth for every single experience.
          </li>
          <li>
            <strong>No Guarantee of Accuracy:</strong> The author does not guarantee the 100% truthfulness or accuracy of the experiences shared. This platform was simply built by the author to act as a unified interface to access and read the interview experiences shared by our seniors.
          </li>
        </ul>
      </section>

      {/* Features */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-ox-ink flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-ox-muted" />
          Platform Features
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 bg-ox-surface border border-ox-edge rounded-lg space-y-2">
            <BookOpen className="w-5 h-5 text-ox-accent mb-3" />
            <h3 className="font-semibold text-ox-ink">Centralized Directory</h3>
            <p className="text-sm text-ox-muted">Browse hundreds of experiences across various departments and companies in one place.</p>
          </div>
          <div className="p-5 bg-ox-surface border border-ox-edge rounded-lg space-y-2">
            <Search className="w-5 h-5 text-ox-accent mb-3" />
            <h3 className="font-semibold text-ox-ink">Question Bank</h3>
            <p className="text-sm text-ox-muted">Quickly search through a massive, automatically aggregated list of real technical and HR questions.</p>
          </div>
          <div className="p-5 bg-ox-surface border border-ox-edge rounded-lg space-y-2">
            <FileText className="w-5 h-5 text-ox-accent mb-3" />
            <h3 className="font-semibold text-ox-ink">Lossless Source</h3>
            <p className="text-sm text-ox-muted">We never throw away the original submissions. Read the exact words written by the candidates.</p>
          </div>
          <div className="p-5 bg-ox-surface border border-ox-edge rounded-lg space-y-2">
            <BarChart3 className="w-5 h-5 text-ox-accent mb-3" />
            <h3 className="font-semibold text-ox-ink">Analytics & Insights</h3>
            <p className="text-sm text-ox-muted">Visualize hiring trends, round structures, and acceptance rates to study smarter.</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-ox-ink flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-ox-muted" />
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          <div className="bg-ox-surface border border-ox-edge rounded-lg p-5">
            <h3 className="font-semibold text-ox-ink mb-2">Who can contribute to this platform?</h3>
            <p className="text-sm text-ox-muted leading-relaxed">
              Any student or senior who has gone through the campus placement process can share their experience to help the next batch. You can manually type your experience by clicking the Contribute button.
            </p>
          </div>
          <div className="bg-ox-surface border border-ox-edge rounded-lg p-5">
            <h3 className="font-semibold text-ox-ink mb-2">Are the questions exact matches of the real interview?</h3>
            <p className="text-sm text-ox-muted leading-relaxed">
              The questions are recalled and written from memory by the candidates after their interviews. While they cover the exact concepts discussed, they may not be word-for-word identical to what the interviewer asked.
            </p>
          </div>
          <div className="bg-ox-surface border border-ox-edge rounded-lg p-5">
            <h3 className="font-semibold text-ox-ink mb-2">I noticed a mistake in an AI summarized round. What should I do?</h3>
            <p className="text-sm text-ox-muted leading-relaxed">
              Because we use AI to structure the data, occasional mistakes can happen. You should always refer to the <strong>Original Writeup</strong> section to read exactly what the candidate originally wrote.
            </p>
          </div>
        </div>
      </section>
      
      {/* Call to action */}
      <div className="pt-8 text-center border-t border-ox-edge">
        <p className="text-ox-muted mb-6">Ready to help future candidates?</p>
        <Link
          href="/contribute"
          className="inline-flex justify-center items-center px-6 py-3 text-sm font-semibold text-ox-ink bg-ox-accent border-2 border-ox-ink rounded-lg shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all"
        >
          Share Your Experience
        </Link>
      </div>
    </div>
  );
}
