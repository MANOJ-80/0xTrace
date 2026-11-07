import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCTC(val?: string | number | null): string {
  if (!val) return "Not disclosed";
  const str = String(val);
  if (str.toLowerCase().includes("lpa") || str.toLowerCase().includes("inr") || str.includes("₹")) {
    return str;
  }
  return `₹${str} LPA`;
}

/** Return a consistent semantic badge treatment for candidate outcomes. */
export function getOutcomeBadgeColor(status?: string | null) {
  const s = (status || "").toLowerCase();
  if (s.includes("select") || s.includes("offer")) {
    return "bg-ox-signal-pass/10 text-ox-signal-pass border-ox-signal-pass/25";
  }
  if (s.includes("reject")) {
    return "bg-ox-signal-fail/10 text-ox-signal-fail border-ox-signal-fail/25";
  }
  return "bg-ox-signal-warn/10 text-ox-signal-warn border border-ox-signal-warn/25";
}

export function getRoundTypeBadgeColor(type: string) {
  const t = (type || "").toLowerCase();
  if (t.includes("online") || t.includes("oa") || t.includes("assessment")) {
    return "bg-ox-surface-raised text-ox-text border border-ox-edge";
  }
  if (t.includes("tech") || t.includes("coding")) {
    return "bg-ox-accent/15 text-ox-accent border border-ox-accent/30";
  }
  if (t.includes("hr") || t.includes("behavioral") || t.includes("fit")) {
    return "bg-ox-surface-raised text-ox-text border border-ox-edge";
  }
  if (t.includes("manager")) {
    return "bg-ox-surface-raised text-ox-text border border-ox-edge";
  }
  return "bg-ox-surface-raised text-ox-muted border border-ox-edge";
}
