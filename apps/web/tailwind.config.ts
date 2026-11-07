import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ox: {
          void: "var(--ox-void)",
          surface: "var(--ox-surface)",
          "surface-raised": "var(--ox-surface-raised)",
          window: "var(--ox-window)",
          edge: "var(--ox-edge)",
          text: "var(--ox-text)",
          muted: "var(--ox-muted)",
          ink: "var(--ox-ink)",
          accent: "var(--ox-accent)",
          "accent-hover": "var(--ox-accent-hover)",
          "signal-pass": "var(--ox-signal-pass)",
          "signal-fail": "var(--ox-signal-fail)",
          "signal-warn": "var(--ox-signal-warn)",
        },
      },
      fontFamily: {
        geist: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
      boxShadow: {
        subtle: "var(--shadow-subtle)",
        neo: "3px 3px 0 currentColor",
      },
      maxWidth: {
        container: "1200px",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
