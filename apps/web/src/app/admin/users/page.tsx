import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { PRIVATE_ROBOTS } from "@/lib/metadata";
import AdminUsersClient from "./AdminUsersClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  robots: PRIVATE_ROBOTS,
  title: "People | 0xTrace Admin",
};

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    redirect("/login?callbackUrl=/admin/users");
  }
  if (!session.user.isAdmin) {
    redirect("/");
  }

  return <AdminUsersClient />;
}
