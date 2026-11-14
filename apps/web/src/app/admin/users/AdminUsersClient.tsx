"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type {
  AdminUserDetail,
  AdminUserListResult,
  AdminUserRow,
  AdminUserSort,
} from "@/lib/users";
import {
  Activity,
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Copy,
  Download,
  FileText,
  RefreshCw,
  Search,
  UserPlus,
  Users,
  X,
} from "lucide-react";

const PAGE_SIZES = [25, 50, 100];

function formatDate(value?: string | null, withTime = false): string {
  if (!value) return "Not recorded";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not recorded";
  return date.toLocaleString(
    "en-IN",
    withTime
      ? {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      : { day: "numeric", month: "short", year: "numeric" }
  );
}

function initials(user: AdminUserRow): string {
  const source = (user.name || user.email.split("@")[0] || "?").trim();
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  return `${parts[0]?.[0] || "?"}${parts[1]?.[0] || ""}`.toUpperCase();
}

function AccountDetail({ detail }: { detail: AdminUserDetail }) {
  const { user, experiences, activity } = detail;
  const signIns = user?.sign_in_count ?? 0;

  return (
    <div className="admin-user-detail">
      <div className="admin-user-detail-summary">
        <span>First seen {formatDate(user?.first_seen_at, true)}</span>
        <span>Last sign-in {formatDate(user?.last_sign_in_at, true)}</span>
        <span>
          {signIns} sign-in{signIns === 1 ? "" : "s"}
        </span>
      </div>
      <div className="admin-user-detail-grid">
        <section>
          <h3>Submissions</h3>
          {experiences.length === 0 ? (
            <p className="admin-secondary-cell">No submissions yet.</p>
          ) : (
            <ul className="admin-user-list">
              {experiences.map((item) => (
                <li key={item._id}>
                  <Link
                    href={`/experiences/${item.id || item._id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="admin-user-list-link"
                  >
                    {item.company || "Unknown company"}
                    {item.role ? <span> · {item.role}</span> : null}
                  </Link>
                  <span className="admin-secondary-cell">
                    {item.moderation_status || "unknown"} · {formatDate(item.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section>
          <h3>Recent activity</h3>
          {activity.length === 0 ? (
            <p className="admin-secondary-cell">No recorded edits.</p>
          ) : (
            <ul className="admin-user-list">
              {activity.map((item) => (
                <li key={item._id}>
                  <span className="admin-primary-cell">{item.action}</span>
                  <span className="admin-secondary-cell">
                    {item.target_company || item.target_candidate || "No record"} ·{" "}
                    {formatDate(item.created_at, true)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

export default function AdminUsersClient() {
  const [data, setData] = useState<AdminUserListResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [sort, setSort] = useState<AdminUserSort>("active");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [reload, setReload] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [details, setDetails] = useState<Record<string, AdminUserDetail>>({});
  const [detailLoading, setDetailLoading] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(q.trim()), 300);
    return () => clearTimeout(timer);
  }, [q]);

  useEffect(() => {
    setPage(1);
    setExpanded(null);
  }, [debouncedQ, sort, limit]);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (debouncedQ) params.set("q", debouncedQ);
    params.set("sort", sort);
    params.set("page", String(page));
    params.set("limit", String(limit));
    return params.toString();
  }, [debouncedQ, sort, page, limit]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");

    fetch(`/api/admin/users?${query}`, { signal: controller.signal })
      .then(async (res) => {
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.error || "Failed to load accounts");
        return payload as AdminUserListResult;
      })
      .then((payload) => {
        setData(payload);
        if (payload.page > payload.totalPages) setPage(payload.totalPages);
      })
      .catch((err: Error) => {
        if (err.name !== "AbortError") setError(err.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [query, reload]);

  const users = data?.users || [];
  const stats = data?.stats;
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const toggleDetail = async (user: AdminUserRow) => {
    if (expanded === user.email) {
      setExpanded(null);
      return;
    }

    setExpanded(user.email);
    if (details[user.email]) return;

    setDetailLoading(user.email);
    setError("");
    try {
      const res = await fetch(
        `/api/admin/users/detail?email=${encodeURIComponent(user.email)}`
      );
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Failed to load account");
      setDetails((current) => ({ ...current, [user.email]: payload }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDetailLoading((current) => (current === user.email ? null : current));
    }
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
          <h1 className="page-title">People</h1>
          <p className="page-description">
            Accounts that have signed in with a college Google account. Accounts are
            recorded from the first sign-in after tracking was enabled.
          </p>
        </div>
        <div className="admin-page-actions">
          <nav className="admin-page-nav" aria-label="Admin tools">
            <Link href="/admin/activity" className="admin-nav-link">
              <Activity className="h-4 w-4" />
              Activity
            </Link>
            <Link href="/admin/duplicates" className="admin-nav-link">
              <Copy className="h-4 w-4" />
              Duplicates
            </Link>
            <a href="/api/admin/users/export" className="admin-nav-link">
              <Download className="h-4 w-4" />
              CSV
            </a>
          </nav>
          <button
            type="button"
            onClick={() => setReload((value) => value + 1)}
            className="ui-action-secondary"
            aria-label="Refresh accounts"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </header>

      <section className="admin-stats" aria-label="Account summary">
        <div className="admin-stat">
          <span className="admin-stat-icon">
            <Users className="h-4 w-4" />
          </span>
          <span className="admin-stat-label">Accounts</span>
          <strong className="admin-stat-value">
            {stats ? stats.total.toLocaleString() : "—"}
          </strong>
          <span className="admin-stat-note">College Google accounts seen on sign-in</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat-icon">
            <Activity className="h-4 w-4" />
          </span>
          <span className="admin-stat-label">Recently active</span>
          <strong className="admin-stat-value">
            {stats ? stats.active15m.toLocaleString() : "—"}
          </strong>
          <span className="admin-stat-note">Active in the last 15 minutes</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat-icon">
            <UserPlus className="h-4 w-4" />
          </span>
          <span className="admin-stat-label">New this week</span>
          <strong className="admin-stat-value">
            {stats ? stats.new7d.toLocaleString() : "—"}
          </strong>
          <span className="admin-stat-note">First seen in the last seven days</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat-icon">
            <FileText className="h-4 w-4" />
          </span>
          <span className="admin-stat-label">Contributors</span>
          <strong className="admin-stat-value">
            {stats ? stats.contributors.toLocaleString() : "—"}
          </strong>
          <span className="admin-stat-note">Students with at least one submission</span>
        </div>
      </section>

      {error && (
        <div className="feedback-error" role="alert">
          {error}
        </div>
      )}

      <section className="ui-panel admin-table-panel">
        <div className="admin-toolbar">
          <div className="admin-search">
            <Search className="h-4 w-4" aria-hidden="true" />
            <input
              type="search"
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Search name or email"
              aria-label="Search accounts"
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ("")}
                aria-label="Clear search"
                className="admin-search-clear"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="admin-filters">
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as AdminUserSort)}
              aria-label="Sort accounts"
            >
              <option value="active">Last active</option>
              <option value="newest">Newest first</option>
              <option value="name">Name A–Z</option>
            </select>

            <select
              value={limit}
              onChange={(event) => setLimit(Number(event.target.value))}
              aria-label="Rows per page"
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size} per page
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table w-full border-collapse admin-users-table">
            <thead>
              <tr>
                <th>Person</th>
                <th>First seen</th>
                <th>Last active</th>
                <th>Sign-ins</th>
                <th>Submissions</th>
                <th>Role</th>
                <th>
                  <span className="sr-only">Details</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isOpen = expanded === user.email;
                const detail = details[user.email];
                return (
                  <Fragment key={user.email}>
                    <tr>
                      <td>
                        <button
                          type="button"
                          onClick={() => toggleDetail(user)}
                          className="admin-user-cell admin-user-toggle"
                          aria-expanded={isOpen}
                        >
                          <span className="admin-user-avatar" aria-hidden="true">
                            {initials(user)}
                          </span>
                          <span className="min-w-0">
                            <span className="admin-primary-cell block truncate">
                              {user.name || "Unnamed account"}
                            </span>
                            <span className="admin-secondary-cell block truncate">
                              {user.email}
                            </span>
                          </span>
                        </button>
                      </td>
                      <td className="whitespace-nowrap">
                        {formatDate(user.first_seen_at)}
                      </td>
                      <td className="whitespace-nowrap">
                        {formatDate(user.last_seen_at, true)}
                      </td>
                      <td className="admin-num-cell">{user.sign_in_count}</td>
                      <td className="admin-num-cell">{user.submissions}</td>
                      <td>
                        <span
                          className={`admin-badge ${
                            user.is_admin ? "admin-badge--pass" : "admin-badge--muted"
                          }`}
                        >
                          {user.is_admin ? "Admin" : "Student"}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => toggleDetail(user)}
                          className="admin-icon-action"
                          aria-expanded={isOpen}
                          aria-label={`${isOpen ? "Hide" : "Show"} details for ${user.email}`}
                          title={isOpen ? "Hide details" : "Show details"}
                        >
                          {isOpen ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="admin-user-detail-row">
                        <td colSpan={7}>
                          {detailLoading === user.email ? (
                            <p className="admin-secondary-cell admin-user-detail-loading">
                              Loading account details…
                            </p>
                          ) : detail ? (
                            <AccountDetail detail={detail} />
                          ) : (
                            <p className="admin-secondary-cell admin-user-detail-loading">
                              Account details are unavailable.
                            </p>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>

          {!loading && users.length === 0 && (
            <div className="admin-empty">
              <p className="admin-empty-title">
                {debouncedQ ? "No accounts match this search." : "No accounts tracked yet."}
              </p>
              <p className="admin-empty-copy">
                {debouncedQ
                  ? "Try a different name or email address."
                  : "Accounts appear here after a student signs in with their college Google account."}
              </p>
            </div>
          )}
        </div>

        <footer className="admin-table-footer">
          <span>
            Showing {start.toLocaleString()}–{end.toLocaleString()} of{" "}
            {total.toLocaleString()}
          </span>
          <div className="admin-pagination">
            <button
              type="button"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={page <= 1 || loading}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              disabled={page >= totalPages || loading}
              aria-label="Next page"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}
