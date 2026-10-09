import { getAnalyticsData } from "@/lib/data";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import { BarChart3 } from "lucide-react";

export const revalidate = 3600;

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
    <main className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="text-center space-y-3 mb-10">
        <div className="mx-auto w-12 h-12 rounded-full bg-ox-accent/10 border-2 border-ox-accent flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-ox-accent" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-ox-ink">
          Analytics Dashboard
        </h1>
        <p className="text-sm text-ox-muted max-w-lg mx-auto">
          Visualize placement trends, company breakdowns, round patterns, and question distributions across {data.totals.experiences} experiences.
        </p>
      </div>

      <AnalyticsDashboard data={data} />
    </main>
  );
}
