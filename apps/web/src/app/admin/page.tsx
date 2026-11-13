import AdminDashboardClient from "./AdminDashboardClient";
import { PRIVATE_ROBOTS } from "@/lib/metadata";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  robots: PRIVATE_ROBOTS,
  title: "Admin | 0xTrace",
};

export default function AdminPage() {
  return <AdminDashboardClient />;
}
