import { Suspense } from "react";
import { getAllExperiences, getCompanyStats } from "@/lib/data";
import ExperienceDirectoryClient from "./ExperienceDirectoryClient";

export const metadata = {
  title: "All Experiences — 0xTrace Placement Intelligence",
  description: "Browse 126 audited placement interview experiences across 60+ top companies.",
};

export default async function ExperiencesPage() {
  const experiences = await getAllExperiences();
  const companies = await getCompanyStats();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Interview Experiences Directory
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Explore {experiences.length} canonical interview records. Filter by company, outcome, and role to inspect verbatim round questions and candidate preparation insights.
        </p>
      </div>

      <Suspense fallback={<div className="text-sm text-slate-500 py-8 text-center">Loading experiences directory...</div>}>
        <ExperienceDirectoryClient
          initialExperiences={experiences}
          companies={companies.map((c) => c.name)}
        />
      </Suspense>
    </div>
  );
}
