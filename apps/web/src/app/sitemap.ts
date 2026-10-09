import { MetadataRoute } from "next";
import { getAllExperiences } from "@/lib/data";
import { Experience } from "@/lib/types";

export const revalidate = 86400; // Cache sitemap for 24 hours

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXTAUTH_URL || "https://0x-trace.vercel.app";

  let experiences: Experience[] = [];
  try {
    experiences = await getAllExperiences();
  } catch (e) {
    // fallback if DB unavailable during static build
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/experiences`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/questions`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/analytics`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const experienceRoutes: MetadataRoute.Sitemap = experiences.map((exp) => ({
    url: `${siteUrl}/experiences/${exp._id || exp.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...experienceRoutes];
}
