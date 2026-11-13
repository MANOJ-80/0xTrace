import { Suspense } from "react";
import { getExperienceSummaries, getCompanyStats } from "@/lib/data";
import ExperienceDirectoryClient from "./ExperienceDirectoryClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Interview Experiences Directory",
  description:
    "Browse campus placement interview experiences by company, role, and outcome, with structured rounds and candidate writeups.",
  openGraph: {
    title: "Interview Experiences Directory | 0xTrace",
    description:
      "Browse campus placement interview experiences by company, role, and outcome, with structured rounds and candidate writeups.",
    siteName: "0xTrace",
  },
  twitter: {
    card: "summary_large_image",
    title: "Interview Experiences Directory | 0xTrace",
    description:
      "Browse campus placement interview experiences by company, role, and outcome, with structured rounds and candidate writeups.",
  },
};

export default async function ExperiencesPage() {
  const experiences = await getExperienceSummaries();
  const companies = await getCompanyStats();

  return (
    <div className="space-y-6">
      <header className="page-heading">
        <div className="page-heading-copy">
          <div className="page-kicker">Interview library</div>
          <h1 className="page-title">Explore interview experiences</h1>
          <p className="page-description">
            Search {experiences.length} campus placement records by company, role, or outcome. Each record keeps the candidate's original writeup alongside its structured rounds.
          </p>
        </div>
        <div className="library-count"><span className="library-count-number">{experiences.length.toLocaleString()}</span><span>records</span></div>
      </header>

      <Suspense fallback={<div className="text-sm text-ox-muted py-8 text-center">Loading experiences directory...</div>}>
        <ExperienceDirectoryClient
          initialExperiences={experiences}
          companies={companies.map((c) => c.name).sort((a, b) => a.localeCompare(b))}
          roles={Array.from(new Set(experiences.map(e => e.job?.role).filter(Boolean) as string[])).sort()}
        />
      </Suspense>
    </div>
  );
}
