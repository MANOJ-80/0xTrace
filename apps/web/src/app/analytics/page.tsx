import { getAnalyticsData } from "@/lib/data";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import { BarChart3 } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Placement Analytics & Insights",
  description:
    "Visualize campus placement trends, company hiring breakdowns, compensation distributions, and interview round difficulty.",
  openGraph: {
    title: "Placement Analytics & Insights | 0xTrace",
    description:
      "Visualize campus placement trends, company hiring breakdowns, compensation distributions, and interview round difficulty.",
    siteName: "0xTrace",
  },
  twitter: {
    card: "summary_large_image",
    title: "Placement Analytics & Insights | 0xTrace",
    description:
      "Visualize campus placement trends, company hiring breakdowns, compensation distributions, and interview round difficulty.",
  },
};

export default async function AnalyticsPage() {
  const data = await getAnalyticsData();

  return (
    <div className="space-y-7">
      <header className="page-heading">
        <div className="page-heading-copy">
          <div className="page-kicker">Placement data</div>
          <h1 className="page-title">Hiring patterns at a glance</h1>
          <p className="page-description">
            Company activity, interview rounds, and question topics across {data.totals.experiences} experiences.
          </p>
        </div>
        <div className="page-heading-icon"><BarChart3 className="w-5 h-5 text-ox-accent" /></div>
      </header>

      <div className="analytics-intro-note">
        <span className="analytics-note-dot" />
        <span>Use these summaries to spot patterns. Candidate accounts remain the source for individual interview details.</span>
      </div>

      <AnalyticsDashboard data={data} />
    </div>
  );
}
