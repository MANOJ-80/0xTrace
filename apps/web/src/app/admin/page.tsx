import AdminDashboardClient from "./AdminDashboardClient";

export const revalidate = 3600;

export default function AdminPage() {
  return <AdminDashboardClient />;
}
