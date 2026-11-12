import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";

/**
 * Session guard for admin API routes.
 *
 * Page routes are protected by middleware, but route handlers are reachable
 * directly, so every /api/admin handler calls this itself.
 */
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !session.user.isAdmin) {
    return null;
  }
  return session;
}
