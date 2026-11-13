import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "0xTrace — Campus Interview Intelligence",
    short_name: "0xTrace",
    description:
      "Campus placement interview experiences with round-by-round questions and original candidate accounts.",
    start_url: "/",
    display: "standalone",
    background_color: "#F5F3EE",
    theme_color: "#25241F",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
