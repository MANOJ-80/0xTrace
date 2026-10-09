import { Info, ShieldAlert, Sparkles, HelpCircle, BookOpen, Search, BarChart3, FileText, ArrowRight } from "lucide-react";
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
    <div className="max-w-4xl mx-auto space-y-8 sm:space-y-12 pb-8 sm:pb-12">
      {/* Header */}
      <section className="text-center space-y-3 sm:space-y-4">
        <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-ox-surface-raised border-2 border-ox-edge rounded-2xl flex items-center justify-center shadow-neo">
          <Info className="w-7 h-7 sm:w-8 sm:h-8 text-ox-accent" />
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-ox-ink font-geist tracking-tight">
          About 0xTrace
        </h1>
        <p className="text-sm sm:text-lg text-ox-muted max-w-2xl mx-auto leading-relaxed">
          A single, unified platform designed to centralize interview experiences shared by seniors across different companies and departments.
        </p>
      </section>

      {/* Guidelines & Disclaimers (Crucial) */}
      <section className="bg-ox-accent/10 border-2 border-ox-accent rounded-xl p-4 sm:p-8 space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2.5 sm:gap-3 mb-2 sm:mb-4">
          <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 text-ox-accent shrink-0" />
          <h2 className="text-base sm:text-xl font-bold text-ox-ink">Important Guidelines & Disclaimer</h2>
        </div>
        <ul className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-ox-ink/90 leading-relaxed list-disc list-inside">
          <li>
            <strong>Educational Purpose Only:</strong> This platform is built strictly for educational purposes to help students prepare for their placements.
          </li>
          <li>
            <strong>AI Summarization & The Source of Truth:</strong> We use Artificial Intelligence to parse and summarize content into structured rounds and questions. Because AI is not perfect, the <span className="font-semibold text-ox-accent">Original Writeup</span> tab is always preserved and remains the ultimate source of truth for every single experience.
          </li>
          <li>
            <strong>No Guarantee of Accuracy:</strong> The author does not guarantee the 100% truthfulness or accuracy of the experiences shared. This platform was simply built by the author to act as a unified interface to access and read the interview experiences shared by our seniors.
          </li>
        </ul>
      </section>

      {/* Features */}
      <section className="space-y-4 sm:space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-ox-ink flex items-center gap-2 font-geist">
          <Sparkles className="w-5 h-5 text-ox-muted" />
          Platform Features
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="p-4 sm:p-5 bg-ox-surface border border-ox-edge rounded-xl space-y-2">
            <BookOpen className="w-5 h-5 text-ox-accent mb-2" />
            <h3 className="font-semibold text-sm sm:text-base text-ox-ink">Centralized Directory</h3>
            <p className="text-xs sm:text-sm text-ox-muted leading-relaxed">Browse hundreds of experiences across various departments and companies in one place.</p>
          </div>
          <div className="p-4 sm:p-5 bg-ox-surface border border-ox-edge rounded-xl space-y-2">
            <Search className="w-5 h-5 text-ox-accent mb-2" />
            <h3 className="font-semibold text-sm sm:text-base text-ox-ink">Question Bank</h3>
            <p className="text-xs sm:text-sm text-ox-muted leading-relaxed">Quickly search through a massive, automatically aggregated list of real technical and HR questions.</p>
          </div>
          <div className="p-4 sm:p-5 bg-ox-surface border border-ox-edge rounded-xl space-y-2">
            <FileText className="w-5 h-5 text-ox-accent mb-2" />
            <h3 className="font-semibold text-sm sm:text-base text-ox-ink">Lossless Source</h3>
            <p className="text-xs sm:text-sm text-ox-muted leading-relaxed">We never throw away the original submissions. Read the exact words written by the candidates.</p>
          </div>
          <div className="p-4 sm:p-5 bg-ox-surface border border-ox-edge rounded-xl space-y-2">
            <BarChart3 className="w-5 h-5 text-ox-accent mb-2" />
            <h3 className="font-semibold text-sm sm:text-base text-ox-ink">Analytics & Insights</h3>
            <p className="text-xs sm:text-sm text-ox-muted leading-relaxed">Visualize hiring trends, round structures, and acceptance rates to study smarter.</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="space-y-4 sm:space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-ox-ink flex items-center gap-2 font-geist">
          <HelpCircle className="w-5 h-5 text-ox-muted" />
          Frequently Asked Questions
        </h2>
        <div className="space-y-3 sm:space-y-4">
          <div className="bg-ox-surface border border-ox-edge rounded-xl p-4 sm:p-5 space-y-1.5">
            <h3 className="font-semibold text-sm sm:text-base text-ox-ink">Who can contribute to this platform?</h3>
            <p className="text-xs sm:text-sm text-ox-muted leading-relaxed">
              Any student or senior who has gone through the campus placement process can share their experience to help the next batch. You can manually type your experience by clicking the Contribute button.
            </p>
          </div>
          <div className="bg-ox-surface border border-ox-edge rounded-xl p-4 sm:p-5 space-y-1.5">
            <h3 className="font-semibold text-sm sm:text-base text-ox-ink">Are the questions exact matches of the real interview?</h3>
            <p className="text-xs sm:text-sm text-ox-muted leading-relaxed">
              The questions are recalled and written from memory by the candidates after their interviews. While they cover the exact concepts discussed, they may not be word-for-word identical to what the interviewer asked.
            </p>
          </div>
          <div className="bg-ox-surface border border-ox-edge rounded-xl p-4 sm:p-5 space-y-1.5">
            <h3 className="font-semibold text-sm sm:text-base text-ox-ink">I noticed a mistake in an AI summarized round. What should I do?</h3>
            <p className="text-xs sm:text-sm text-ox-muted leading-relaxed">
              Because we use AI to structure the data, occasional mistakes can happen. You should always refer to the <strong>Original Writeup</strong> section to read exactly what the candidate originally wrote.
            </p>
          </div>
        </div>
      </section>
      
      {/* Call to action */}
      <div className="pt-6 sm:pt-8 text-center border-t border-ox-edge space-y-4">
        <p className="text-xs sm:text-sm text-ox-muted">Ready to help future candidates?</p>
        <Link
          href="/contribute"
          className="inline-flex justify-center items-center gap-2 w-full sm:w-auto px-6 py-3 text-sm font-semibold text-ox-ink bg-ox-accent border-2 border-ox-ink rounded-lg shadow-neo active:shadow-none min-h-[46px] transition-all"
        >
          <span>Share Your Experience</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
