import { MetadataRoute } from "next";

const siteUrl = process.env.NEXTAUTH_URL || "https://0x-trace.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/experiences", "/about", "/privacy", "/terms"],
        disallow: [
          "/admin",
          "/admin/*",
          "/api/*",
          "/contribute",
          "/upload",
          "/my-experiences",
          "/questions",
          "/analytics",
          "/experiences/",
          "/login",
          "/unauthorized",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
