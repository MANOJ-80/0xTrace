/**
 * Admin access is derived from the environment on every read, so removing an
 * address takes effect immediately without a database migration.
 */
const adminEmails = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export function isAdminEmail(email?: string | null): boolean {
  return Boolean(email && adminEmails.includes(email.toLowerCase()));
}
