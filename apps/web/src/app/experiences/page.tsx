import { Suspense } from "react";
import { getAllExperiences, getCompanyStats } from "@/lib/data";
import ExperienceDirectoryClient from "./ExperienceDirectoryClient";

export const metadata = {
  title: "All Experiences — 0xTrace Placement Intelligence",
  description: "Browse audited placement interview experiences across top companies.",
};

export default async function ExperiencesPage() {
  const experiences = await getAllExperiences();
  const companies = await getCompanyStats();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-xl font-bold text-ox-ink">
          Interview experiences directory
        </h1>
        <p className="text-sm text-ox-muted">
          Explore {experiences.length} canonical interview records. Filter by company, outcome, and role to inspect verbatim round questions and candidate preparation insights.
        </p>
      </div>

      <Suspense fallback={<div className="text-sm text-ox-muted py-8 text-center">Loading experiences directory...</div>}>
        <ExperienceDirectoryClient
          initialExperiences={experiences}
          companies={companies.map((c) => c.name)}
        />
      </Suspense>
    </div>
  );
}
