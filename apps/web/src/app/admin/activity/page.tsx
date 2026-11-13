import Link from "next/link";
import { Activity, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getActivity, type AuditAction } from "@/lib/audit";
import { PRIVATE_ROBOTS } from "@/lib/metadata";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  robots: PRIVATE_ROBOTS,
  title: "Activity log | 0xTrace Admin",
};

const FILTERS: { value: string; label: string }[] = [
  { value: "", label: "All actions" },
  { value: "create", label: "Created" },
  { value: "update", label: "Updated" },
  { value: "merge", label: "Merged" },
  { value: "delete", label: "Deleted" },
  { value: "bulk_delete", label: "Bulk deleted" },
];

const ACTION_LABELS: Record<AuditAction, string> = {
  create: "Created",
  update: "Updated",
  delete: "Deleted",
  bulk_delete: "Bulk deleted",
  merge: "Merged",
};

const ACTION_TONES: Record<AuditAction, string> = {
  create: "pass",
  update: "warn",
  delete: "fail",
  bulk_delete: "fail",
  merge: "pass",
};

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface ActivityPageProps {
  searchParams: Promise<{ page?: string; action?: string }>;
}

export default async function ActivityPage({ searchParams: searchParamsPromise }: ActivityPageProps) {
  const searchParams = await searchParamsPromise;
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    redirect("/login?callbackUrl=/admin/activity");
  }
  if (!session.user.isAdmin) {
    redirect("/");
  }

  const action = FILTERS.some((filter) => filter.value === searchParams.action)
    ? searchParams.action || ""
    : "";
  const page = Math.max(1, Number(searchParams.page || 1) || 1);
  const result = await getActivity({ page, limit: 25, action });

  const pageHref = (target: number, nextAction = action) => {
    const params = new URLSearchParams();
    if (nextAction) params.set("action", nextAction);
    if (target > 1) params.set("page", String(target));
    const query = params.toString();
    return query ? `/admin/activity?${query}` : "/admin/activity";
  };

  return (
    <div className="admin-page space-y-6">
      <header className="page-heading">
        <div className="page-heading-copy">
          <Link href="/admin" className="back-link inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to experience manager
          </Link>
          <div className="page-kicker mt-3">Administration</div>
          <h1 className="page-title">Activity log</h1>
          <p className="page-description">
            A chronological record of submissions, edits, and deletions.
          </p>
        </div>
        <div className="admin-activity-summary">
          <Activity className="h-4 w-4" />
          {result.total.toLocaleString()} event{result.total === 1 ? "" : "s"}
        </div>
      </header>

      <div className="admin-outcomes" aria-label="Filter activity by action">
        {FILTERS.map((filter) => (
          <Link
            key={filter.value || "all"}
            href={pageHref(1, filter.value)}
            className={`admin-outcome-chip ${action === filter.value ? "is-active" : ""}`}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      <section className="ui-panel admin-table-panel">
        <div className="admin-table-wrap">
          <table className="admin-table w-full border-collapse admin-activity-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Action</th>
                <th>Actor</th>
                <th>Record</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {result.entries.map((entry) => (
                <tr key={entry._id}>
                  <td className="whitespace-nowrap">{formatDate(entry.created_at)}</td>
                  <td>
                    <span className={`admin-badge admin-badge--${ACTION_TONES[entry.action] || "warn"}`}>
                      {ACTION_LABELS[entry.action] || entry.action}
                    </span>
                  </td>
                  <td>
                    <div className="admin-primary-cell">{entry.actor_email}</div>
                    {entry.actor_name && (
                      <div className="admin-secondary-cell">{entry.actor_name}</div>
                    )}
                  </td>
                  <td>
                    <div className="admin-primary-cell">
                      {entry.target_company || entry.target_id || "Unknown"}
                    </div>
                    <div className="admin-secondary-cell">
                      {entry.target_candidate && `${entry.target_candidate} · `}
                      {entry.target_count > 1
                        ? `${entry.target_count} records`
                        : entry.target_id || ""}
                    </div>
                  </td>
                  <td className="admin-secondary-cell admin-activity-detail">
                    {entry.detail || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {result.entries.length === 0 && (
            <div className="admin-empty">
              <p className="admin-empty-title">No activity recorded yet.</p>
              <p className="admin-empty-copy">
                Submissions, edits, and deletions will appear here as they happen.
              </p>
            </div>
          )}
        </div>

        <footer className="admin-table-footer">
          <span>
            Page {result.page} of {result.totalPages} · {result.total.toLocaleString()} events
          </span>
          <div className="admin-pagination">
            {result.page > 1 ? (
              <Link href={pageHref(result.page - 1)} className="admin-pagination-link">
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Link>
            ) : (
              <span className="admin-pagination-link is-disabled">
                <ChevronLeft className="h-4 w-4" />
                Previous
              </span>
            )}
            {result.page < result.totalPages ? (
              <Link href={pageHref(result.page + 1)} className="admin-pagination-link">
                Next
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <span className="admin-pagination-link is-disabled">
                Next
                <ChevronRight className="h-4 w-4" />
              </span>
            )}
          </div>
        </footer>
      </section>
    </div>
  );
}
