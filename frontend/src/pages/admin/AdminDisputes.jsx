import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { apiRequest } from "../../lib/api";
import StatusBadge from "../../components/common/StatusBadge";
import { formatStatus } from "../../lib/display";

const STATUS_OPTIONS = ["ALL", "OPEN", "UNDER_REVIEW", "RESOLVED", "REJECTED"];
const PRIORITY_WEIGHT = { HIGH: 3, URGENT: 3, MEDIUM: 2, LOW: 1 };

// Admin resolution actions call PATCH /admin/disputes/<id>/. That endpoint does not exist in
// the current backend yet — it needs a small addition alongside the other Admin*View classes
// in analytics/views.py (+ a matching path in analytics/urls.py). See the chat reply for the
// exact Django code to add.
export default function AdminDisputes() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [updatingId, setUpdatingId] = useState(null);
  const [actionError, setActionError] = useState("");

  const load = () => {
    setLoading(true);
    apiRequest("/admin/disputes/")
      .then(setRows)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return rows
      .filter((row) => status === "ALL" || row.status === status)
      .filter((row) => {
        if (!term) return true;
        return [row.title, row.contract__crop__name, row.contract__farmer__farm_name, row.contract__company__company_name]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(term));
      })
      .sort((a, b) => (PRIORITY_WEIGHT[b.priority] || 0) - (PRIORITY_WEIGHT[a.priority] || 0));
  }, [rows, query, status]);

  const openCount = rows.filter((row) => row.status === "OPEN").length;
  const reviewCount = rows.filter((row) => row.status === "UNDER_REVIEW").length;
  const resolvedCount = rows.filter((row) => row.status === "RESOLVED").length;

  const updateDispute = async (dispute, nextStatus) => {
    setUpdatingId(dispute.id);
    setActionError("");
    try {
      const updated = await apiRequest(`/admin/disputes/${dispute.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });
      setRows((current) => current.map((row) => (row.id === dispute.id ? { ...row, ...updated } : row)));
    } catch (requestError) {
      setActionError(
        requestError?.status === 404
          ? "This action needs a small backend addition (PATCH /admin/disputes/<id>/) — see the note in AdminDisputes.jsx."
          : requestError.message
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="page-shell">
      <div className="container-page">
        <span className="eyebrow">Admin console</span>
        <h1 className="section-title">Dispute queue</h1>
        <p className="section-description">Review reported issues with clear agreement context instead of internal IDs.</p>
        {error && <p className="mt-4 text-sm font-bold text-red-600">{error}</p>}

        {!loading && (
          <div className="metric-grid mt-8">
            <div className="metric-card"><p>Open</p><strong>{openCount}</strong></div>
            <div className="metric-card"><p>Under review</p><strong>{reviewCount}</strong></div>
            <div className="metric-card"><p>Resolved</p><strong>{resolvedCount}</strong></div>
            <div className="metric-card"><p>Total disputes</p><strong>{rows.length}</strong></div>
          </div>
        )}

        <div className="admin-toolbar mt-6">
          <div className="admin-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search title, crop, farmer, or buyer…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <select className="admin-select" value={status} onChange={(event) => setStatus(event.target.value)}>
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>{option === "ALL" ? "All statuses" : formatStatus(option)}</option>
            ))}
          </select>
          <span className="result-count">{filtered.length} of {rows.length}</span>
        </div>

        {actionError && (
          <div className="banner-error">
            <p>{actionError}</p>
            <button type="button" className="btn-tiny" onClick={() => setActionError("")}>Dismiss</button>
          </div>
        )}

        {loading ? (
          <p className="mt-8 text-sm font-bold text-slate-400">Loading disputes…</p>
        ) : filtered.length === 0 ? (
          <div className="empty-state mt-8">
            <strong>No disputes match your filters</strong>
            <p>Try clearing the search or choosing a different status.</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4">
            {filtered.map((row) => (
              <article className={`dispute-card${row.status === "RESOLVED" || row.status === "REJECTED" ? " resolved" : ""}`} key={row.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-heading text-lg font-bold text-navy">{row.title}</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {row.contract__crop__name || "Agreement"} · {row.contract__farmer__farm_name || "Farmer"} ↔ {row.contract__company__company_name || "Buyer"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge-priority ${(row.priority || "medium").toLowerCase()}`}>{formatStatus(row.priority)}</span>
                    <StatusBadge status={row.status} />
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-700">{row.description}</p>
                {row.status !== "RESOLVED" && row.status !== "REJECTED" && (
                  <div className="dispute-actions mt-4">
                    {row.status === "OPEN" && (
                      <button
                        type="button"
                        className="btn-tiny"
                        disabled={updatingId === row.id}
                        onClick={() => updateDispute(row, "UNDER_REVIEW")}
                      >
                        {updatingId === row.id ? "Updating…" : "Mark under review"}
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn-tiny success"
                      disabled={updatingId === row.id}
                      onClick={() => updateDispute(row, "RESOLVED")}
                    >
                      {updatingId === row.id ? "Updating…" : "Mark resolved"}
                    </button>
                    <button
                      type="button"
                      className="btn-tiny danger"
                      disabled={updatingId === row.id}
                      onClick={() => updateDispute(row, "REJECTED")}
                    >
                      {updatingId === row.id ? "Updating…" : "Reject dispute"}
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}