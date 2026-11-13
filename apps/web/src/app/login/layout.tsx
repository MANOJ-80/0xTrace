import type { Metadata } from "next";
import { PRIVATE_ROBOTS } from "@/lib/metadata";

export const metadata: Metadata = {
  robots: PRIVATE_ROBOTS,
  title: "Sign in | 0xTrace",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
