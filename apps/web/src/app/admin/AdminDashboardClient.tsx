"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { AdminExperienceRow, AdminOverview } from "@/lib/admin-experiences";
import {
  Activity,
  AlertTriangle,
  Building2,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Tags,
  Trash2,
  Users,
  X,
} from "lucide-react";

const PAGE_SIZES = [25, 50, 100];

function formatDate(value?: string | null): string {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function outcomeTone(status?: string | null): "pass" | "fail" | "warn" {
  const value = (status || "").toLowerCase();
  if (value.includes("select") || value.includes("offer")) return "pass";
  if (value.includes("reject")) return "fail";
  return "warn";
}

function qualityTone(score?: number | null): "pass" | "warn" | "fail" | "muted" {
  if (typeof score !== "number") return "muted";
  if (score < 60) return "fail";
  if (score < 80) return "warn";
  return "pass";
}

export default function AdminDashboardClient() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [experiences, setExperiences] = useState<AdminExperienceRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [outcome, setOutcome] = useState("");
  const [quality, setQuality] = useState("");
  const [sort, setSort] = useState("recent");

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reload, setReload] = useState(0);

  const loadOverview = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/overview");
      const data = await res.json();
      if (res.ok) setOverview(data);
    } catch {
      // The table stays usable when the summary fails.
    }
  }, []);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(q.trim()), 300);
    return () => clearTimeout(timer);
  }, [q]);

  useEffect(() => {
    setPage(1);
    setSelected(new Set());
  }, [debouncedQ, outcome, quality, sort, limit]);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (debouncedQ) params.set("q", debouncedQ);
    if (outcome) params.set("outcome", outcome);
    if (quality === "attention") params.set("attention", "1");
    else if (quality) params.set("quality", quality);
    params.set("sort", sort);
    params.set("page", String(page));
    params.set("limit", String(limit));
    return params.toString();
  }, [debouncedQ, outcome, quality, sort, page, limit]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");

    fetch(`/api/admin/experiences?${query}`, { signal: controller.signal })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load experiences");
        return data;
      })
      .then((data) => {
        setExperiences(data.experiences || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
        if (data.page > data.totalPages) setPage(data.totalPages);
      })
      .catch((err: Error) => {
        if (err.name !== "AbortError") setError(err.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [query, reload]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  const allSelected = experiences.length > 0 && experiences.every((row) => selected.has(row._id));

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(experiences.map((row) => row._id)));
  };

  const toggleOne = (id: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearFilters = () => {
    setQ("");
    setDebouncedQ("");
    setOutcome("");
    setQuality("");
    setSort("recent");
  };

  const refresh = () => {
    setReload((value) => value + 1);
    loadOverview();
  };

  const normalizeCompanies = async () => {
    if (
      !window.confirm(
        "Recompute the canonical company key for every record? This rewrites company.normalized_name and keeps display names unchanged."
      )
    ) {
      return;
    }

    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/companies/normalize", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Normalization failed");
      setNotice(
        `Normalized ${data.updated.toLocaleString()} of ${data.scanned.toLocaleString()} records across ${data.companies.toLocaleString()} companies (${data.variantGroups.toLocaleString()} spelling variant groups).`
      );
      refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const deleteSelected = async () => {    if (selected.size === 0) return;
    if (
      !window.confirm(
        `Delete ${selected.size} experience${selected.size === 1 ? "" : "s"}? This cannot be undone.`
      )
    ) {
      return;
    }

    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/experiences/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bulk delete failed");
      setNotice(`Deleted ${data.deletedCount} record${data.deletedCount === 1 ? "" : "s"}.`);
      setSelected(new Set());
      refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const deleteOne = async (row: AdminExperienceRow) => {
    const company = row.company?.name || "this record";
    if (!window.confirm(`Delete the experience for ${company}? This cannot be undone.`)) {
      return;
    }

    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/experiences/${row._id || row.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Delete failed");
      }
      setNotice("Record deleted.");
      setSelected((current) => {
        const next = new Set(current);
        next.delete(row._id);
        return next;
      });
      refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const hasFilters = Boolean(debouncedQ || outcome || quality || sort !== "recent");
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="admin-page space-y-6">
      <header className="page-heading">
        <div className="page-heading-copy">
          <div className="page-kicker">Administration</div>
          <h1 className="page-title">Experience manager</h1>
          <p className="page-description">
            Review, search, and maintain every interview record in the archive.
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
            <button
              type="button"
              onClick={normalizeCompanies}
              disabled={busy}
              className="admin-nav-link"
              title="Recompute the canonical company key for every record"
            >
              <Tags className="h-4 w-4" />
              Normalize names
            </button>
            <a href="/api/admin/export?format=json" className="admin-nav-link">
              <Download className="h-4 w-4" />
              JSON
            </a>
            <a href="/api/admin/export?format=csv" className="admin-nav-link">
              <Download className="h-4 w-4" />
              CSV
            </a>
          </nav>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={refresh} className="ui-action-secondary" aria-label="Refresh records">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <Link href="/contribute" className="ui-action-primary">
              <Plus className="h-4 w-4" />
              Add experience
            </Link>
          </div>
        </div>
      </header>

      <section className="admin-stats" aria-label="Archive summary">
        <div className="admin-stat">
          <span className="admin-stat-icon"><Building2 className="h-4 w-4" /></span>
          <span className="admin-stat-label">Records</span>
          <strong className="admin-stat-value">{overview ? overview.total.toLocaleString() : "—"}</strong>
          <span className="admin-stat-note">Interview experiences in the archive</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat-icon"><Users className="h-4 w-4" /></span>
          <span className="admin-stat-label">Companies</span>
          <strong className="admin-stat-value">{overview ? overview.companies.toLocaleString() : "—"}</strong>
          <span className="admin-stat-note">Represented in the archive</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat-icon"><AlertTriangle className="h-4 w-4" /></span>
          <span className="admin-stat-label">Needs attention</span>
          <strong className="admin-stat-value">{overview ? overview.attention.toLocaleString() : "—"}</strong>
          <span className="admin-stat-note">
            {overview
              ? `${overview.flagged.toLocaleString()} quality flags · ${overview.missingRole.toLocaleString()} missing a role${
                  overview.missingIdentity > 0
                    ? ` · ${overview.missingIdentity.toLocaleString()} missing identity`
                    : ""
                }`
              : "Loading summary"}
          </span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat-icon"><CalendarClock className="h-4 w-4" /></span>
          <span className="admin-stat-label">New this week</span>
          <strong className="admin-stat-value">{overview ? overview.last7Days.toLocaleString() : "—"}</strong>
          <span className="admin-stat-note">Submitted in the last 7 days</span>
        </div>
      </section>

      {overview && overview.outcomes.length > 0 && (
        <div className="admin-outcomes" aria-label="Filter by outcome">
          {overview.outcomes.map((item) => (
            <button
              key={item.status}
              type="button"
              onClick={() => setOutcome(outcome === item.status ? "" : item.status)}
              className={`admin-outcome-chip ${outcome === item.status ? "is-active" : ""}`}
            >
              <span>{item.status}</span>
              <strong>{item.count}</strong>
            </button>
          ))}
          {outcome && (
            <button type="button" onClick={() => setOutcome("")} className="admin-outcome-clear">
              Clear outcome
            </button>
          )}
        </div>
      )}

      {error && <div className="feedback-error" role="alert">{error}</div>}
      {notice && <div className="feedback-success" role="status">{notice}</div>}

      <section className="ui-panel admin-table-panel">
        <div className="admin-toolbar">
          <div className="admin-search">
            <Search className="h-4 w-4" aria-hidden="true" />
            <input
              type="search"
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Search company, candidate, role, author, or ID"
              aria-label="Search records"
            />
            {q && (
              <button type="button" onClick={() => setQ("")} aria-label="Clear search" className="admin-search-clear">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="admin-filters">
            <select
              value={quality}
              onChange={(event) => setQuality(event.target.value)}
              aria-label="Filter by quality"
            >
              <option value="">All records</option>
              <option value="attention">Needs attention</option>
              <option value="flagged">Quality flags</option>
              <option value="ok">No quality flags</option>
            </select>

            <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort records">
              <option value="recent">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="company">Company A–Z</option>
              <option value="candidate">Candidate A–Z</option>
              <option value="quality">Lowest quality</option>
            </select>

            <select
              value={limit}
              onChange={(event) => setLimit(Number(event.target.value))}
              aria-label="Rows per page"
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>{size} per page</option>
              ))}
            </select>

            {hasFilters && (
              <button type="button" onClick={clearFilters} className="admin-clear-filters">
                Clear filters
              </button>
            )}
          </div>
        </div>

        {selected.size > 0 && (
          <div className="admin-bulk-bar" role="status">
            <span>{selected.size} selected</span>
            <div className="flex items-center gap-2">
              <button type="button" onClick={deleteSelected} disabled={busy} className="admin-danger-action">
                <Trash2 className="h-4 w-4" />
                Delete selected
              </button>
              <button type="button" onClick={() => setSelected(new Set())} className="admin-plain-action">
                Clear selection
              </button>
            </div>
          </div>
        )}

        <div className="admin-table-wrap">
          <table className="admin-table w-full border-collapse">
            <thead>
              <tr>
                <th className="admin-check-cell">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="Select all records on this page"
                  />
                </th>
                <th>Company</th>
                <th>Candidate</th>
                <th>Role</th>
                <th>Outcome</th>
                <th>Quality</th>
                <th className="hidden lg:table-cell">Added</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 6 }).map((_, index) => (
                  <tr key={`skeleton-${index}`}>
                    <td colSpan={8}>
                      <div className="skeleton-block h-9 w-full" />
                    </td>
                  </tr>
                ))}

              {!loading &&
                experiences.map((row) => {
                  const tone = outcomeTone(row.outcome?.status);
                  const scoreTone = qualityTone(row.quality?.score);
                  const issues = row.quality?.issues?.length || 0;
                  const isSelected = selected.has(row._id);

                  return (
                    <tr key={row._id} className={isSelected ? "is-selected" : undefined}>
                      <td className="admin-check-cell">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleOne(row._id)}
                          aria-label={`Select experience for ${row.company?.name || "unknown company"}`}
                        />
                      </td>
                      <td>
                        <div className="admin-primary-cell">{row.company?.name || "Unknown"}</div>
                        <div className="admin-secondary-cell">
                          {row.id || row._id}
                          {row.source?.experience_number ? ` · #${row.source.experience_number}` : ""}
                        </div>
                      </td>
                      <td>
                        <div className="admin-primary-cell">{row.candidate?.name || "Anonymous"}</div>
                        <div className="admin-secondary-cell truncate max-w-[180px]">
                          {row.author?.email || "No author"}
                        </div>
                      </td>
                      <td className="max-w-[180px]">
                        <div className="truncate">{row.job?.role || "Not specified"}</div>
                        <div className="admin-secondary-cell">
                          {row.round_count} round{row.round_count === 1 ? "" : "s"} · {row.question_count} questions
                        </div>
                      </td>
                      <td>
                        <span className={`admin-badge admin-badge--${tone}`}>
                          {row.outcome?.status || "Unknown"}
                        </span>
                      </td>
                      <td>
                        <span className={`admin-quality admin-quality--${scoreTone}`}>
                          {typeof row.quality?.score === "number" ? `${row.quality.score}%` : "Not scored"}
                        </span>
                        <div className="admin-secondary-cell">
                          {issues > 0 ? `${issues} issue${issues === 1 ? "" : "s"}` : "No issues"}
                        </div>
                      </td>
                      <td className="hidden lg:table-cell whitespace-nowrap">{formatDate(row.created_at)}</td>
                      <td>
                        <div className="admin-row-actions">
                          <Link
                            href={`/experiences/${row._id || row.id}`}
                            target="_blank"
                            className="admin-icon-action"
                            aria-label={`View experience for ${row.company?.name || "unknown company"}`}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/admin/edit/${row._id || row.id}`}
                            className="admin-icon-action"
                            aria-label={`Edit experience for ${row.company?.name || "unknown company"}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => deleteOne(row)}
                            disabled={busy}
                            className="admin-icon-action admin-icon-action--danger"
                            aria-label={`Delete experience for ${row.company?.name || "unknown company"}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>

          {!loading && experiences.length === 0 && (
            <div className="admin-empty">
              <p className="admin-empty-title">No records match these filters.</p>
              <p className="admin-empty-copy">Try a different company, candidate, or quality filter.</p>
              {hasFilters && (
                <button type="button" onClick={clearFilters} className="ui-action-secondary mt-4">
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        <footer className="admin-table-footer">
          <span>
            Showing {start.toLocaleString()}–{end.toLocaleString()} of {total.toLocaleString()}
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
