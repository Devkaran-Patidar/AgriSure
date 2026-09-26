import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { apiRequest } from "../../lib/api";
import StatusBadge from "../../components/common/StatusBadge";
import { formatCurrency, formatStatus } from "../../lib/display";

const STATUS_OPTIONS = ["ALL", "DRAFT", "NEGOTIATING", "AGREED", "ACTIVE", "COMPLETED", "CANCELLED"];

export default function AdminContracts() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [sort, setSort] = useState({ key: "created_at", dir: "desc" });

  useEffect(() => {
    apiRequest("/admin/contracts/")
      .then(setRows)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return rows
      .filter((row) => status === "ALL" || row.status === status)
      .filter((row) => {
        if (!term) return true;
        return [row.crop__name, row.farmer__farm_name, row.company__company_name]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(term));
      })
      .sort((a, b) => compare(a, b, sort));
  }, [rows, query, status, sort]);

  const totalValue = filtered.reduce((sum, row) => sum + Number(row.agreed_price || 0), 0);

  const toggleSort = (key) => {
    setSort((current) =>
      current.key === key ? { key, dir: current.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }
    );
  };

  return (
    <div className="page-shell">
      <div className="container-page">
        <span className="eyebrow">Admin console</span>
        <h1 className="section-title">Agreement oversight</h1>
        <p className="section-description">Track crop agreements between farmers and buyers across the platform.</p>
        {error && <p className="mt-4 text-sm font-bold text-red-600">{error}</p>}

        {!loading && (
          <div className="metric-grid mt-8">
            <div className="metric-card"><p>Agreements shown</p><strong>{filtered.length}</strong></div>
            <div className="metric-card"><p>Combined value</p><strong>{formatCurrency(totalValue)}</strong></div>
            <div className="metric-card"><p>Active</p><strong>{rows.filter((r) => r.status === "ACTIVE").length}</strong></div>
            <div className="metric-card"><p>Negotiating</p><strong>{rows.filter((r) => r.status === "NEGOTIATING").length}</strong></div>
          </div>
        )}

        <div className="admin-toolbar mt-6">
          <div className="admin-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search crop, farmer, or buyer…"
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

        {loading ? (
          <p className="mt-8 text-sm font-bold text-slate-400">Loading agreements...</p>
        ) : filtered.length === 0 ? (
          <div className="empty-state mt-8">
            <strong>No agreements match your filters</strong>
            <p>Try clearing the search or choosing a different status.</p>
          </div>
        ) : (
          <div className="table-wrap mt-8">
            <table>
              <thead>
                <tr>
                  <th>Agreement</th>
                  <th>Crop</th>
                  <th>Farmer</th>
                  <th>Buyer</th>
                  <SortableHeader label="Status" sortKey="status" sort={sort} onSort={toggleSort} />
                  <SortableHeader label="Price" sortKey="agreed_price" sort={sort} onSort={toggleSort} />
                  <SortableHeader label="Created" sortKey="created_at" sort={sort} onSort={toggleSort} />
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id}>
                    <td>{row.crop__name ? `${row.crop__name} agreement` : "Agreement"}</td>
                    <td>{row.crop__name || "—"}</td>
                    <td>{row.farmer__farm_name || "—"}</td>
                    <td>{row.company__company_name || "—"}</td>
                    <td><StatusBadge status={row.status} /></td>
                    <td>{row.agreed_price ? formatCurrency(row.agreed_price) : "Pending"}</td>
                    <td>{row.created_at ? new Date(row.created_at).toLocaleDateString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function compare(a, b, sort) {
  const dir = sort.dir === "asc" ? 1 : -1;
  const valueA = a[sort.key];
  const valueB = b[sort.key];
  if (valueA == null) return 1;
  if (valueB == null) return -1;
  if (sort.key === "created_at") return (new Date(valueA) - new Date(valueB)) * dir;
  if (typeof valueA === "number" || typeof valueA === "string" && !Number.isNaN(Number(valueA))) {
    return (Number(valueA) - Number(valueB)) * dir;
  }
  return String(valueA).localeCompare(String(valueB)) * dir;
}

function SortableHeader({ label, sortKey, sort, onSort }) {
  const active = sort.key === sortKey;
  return (
    <th className="sortable-th" onClick={() => onSort(sortKey)}>
      {label}
      {active && <span className="dir">{sort.dir === "asc" ? "↑" : "↓"}</span>}
    </th>
  );
}