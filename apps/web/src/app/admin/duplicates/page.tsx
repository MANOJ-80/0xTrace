import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { ArrowLeft, Copy, ExternalLink, Pencil } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { findDuplicateGroups } from "@/lib/admin-experiences";
import MergeIntoButton from "./MergeIntoButton";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Duplicates | 0xTrace Admin",
};

function formatDate(value?: string | null): string {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function DuplicatesPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    redirect("/login?callbackUrl=/admin/duplicates");
  }
  if (!session.user.isAdmin) {
    redirect("/");
  }

  const result = await findDuplicateGroups();

  return (
    <div className="admin-page space-y-6">
      <header className="page-heading">
        <div className="page-heading-copy">
          <Link href="/admin" className="back-link inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to experience manager
          </Link>
          <div className="page-kicker mt-3">Administration</div>
          <h1 className="page-title">Possible duplicates</h1>
          <p className="page-description">
            Records that share the same company and candidate, matched ignoring case
            and surrounding whitespace. Merge fills empty fields on one record, then
            deletes the others.
          </p>
        </div>
        <div className="admin-activity-summary">
          <Copy className="h-4 w-4" />
          {result.totalGroups.toLocaleString()} group
          {result.totalGroups === 1 ? "" : "s"} ·{" "}
          {result.totalRecords.toLocaleString()} records
        </div>
      </header>

      {result.groups.length === 0 ? (
        <section className="ui-panel admin-empty">
          <p className="admin-empty-title">No duplicate candidates found.</p>
          <p className="admin-empty-copy">
            Every company and candidate pair appears once in the archive.
          </p>
        </section>
      ) : (
        <div className="admin-duplicate-list">
          {result.groups.map((group) => (
            <section key={group.key} className="ui-panel admin-duplicate-group">
              <header className="admin-duplicate-head">
                <div>
                  <h2>{group.company}</h2>
                  <p>{group.candidate}</p>
                </div>
                <span className="admin-badge admin-badge--warn">
                  {group.count} records
                </span>
              </header>

              <div className="admin-table-wrap">
                <table className="admin-table w-full border-collapse">
                  <thead>
                    <tr>
                      <th>Record</th>
                      <th>Role</th>
                      <th>Outcome</th>
                      <th className="hidden lg:table-cell">Author</th>
                      <th className="hidden lg:table-cell">Added</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.records.map((record) => (
                      <tr key={record._id}>
                        <td>
                          <div className="admin-primary-cell">
                            {record.id || record._id}
                          </div>
                          <div className="admin-secondary-cell">
                            {record.source_file || "No source file"}
                          </div>
                        </td>
                        <td>{record.role || "Not specified"}</td>
                        <td>
                          <span className="admin-badge admin-badge--warn">
                            {record.outcome || "Unknown"}
                          </span>
                        </td>
                        <td className="hidden lg:table-cell">
                          {record.author_email || "No author"}
                        </td>
                        <td className="hidden lg:table-cell whitespace-nowrap">
                          {formatDate(record.created_at)}
                        </td>
                        <td>
                          <div className="admin-row-actions">
                            <Link
                              href={`/experiences/${record._id}`}
                              target="_blank"
                              className="admin-icon-action"
                              aria-label="View record"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                            <MergeIntoButton
                              targetId={record._id}
                              targetLabel={`${record.id || record._id} (${group.company})`}
                              sourceIds={group.records
                                .filter((item) => item._id !== record._id)
                                .map((item) => item._id)}
                            />
                            <Link
                              href={`/admin/edit/${record._id}`}
                              className="admin-icon-action"
                              aria-label="Edit record"
                            >
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
