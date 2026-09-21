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

export function getOutcomeBadgeColor(status?: string | null) {
  const s = (status || "").toLowerCase();
  if (s.includes("select") || s.includes("offer")) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800";
  }
  if (s.includes("reject")) {
    return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800";
  }
  return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800";
}

export function getRoundTypeBadgeColor(type: string) {
  const t = (type || "").toLowerCase();
  if (t.includes("online") || t.includes("oa") || t.includes("assessment")) {
    return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800";
  }
  if (t.includes("tech") || t.includes("coding")) {
    return "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800";
  }
  if (t.includes("hr") || t.includes("behavioral") || t.includes("fit")) {
    return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800";
  }
  if (t.includes("manager")) {
    return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800";
  }
  return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800";
}
