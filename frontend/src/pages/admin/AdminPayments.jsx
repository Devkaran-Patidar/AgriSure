import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { apiRequest } from "../../lib/api";
import StatusBadge from "../../components/common/StatusBadge";
import { formatCurrency, formatTransactionType } from "../../lib/display";

const TYPE_OPTIONS = [
  { value: "ALL", label: "All types" },
  { value: "FUNDING", label: "Escrow funding" },
  { value: "RELEASE", label: "Milestone release" },
];
const STATUS_OPTIONS = ["ALL", "PENDING", "COMPLETED"];

export default function AdminPayments() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [type, setType] = useState("ALL");
  const [status, setStatus] = useState("ALL");

  useEffect(() => {
    apiRequest("/admin/payments/")
      .then(setRows)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return rows
      .filter((row) => type === "ALL" || row.transaction_type === type)
      .filter((row) => status === "ALL" || row.status === status)
      .filter((row) => {
        if (!term) return true;
        return [
          row.account__contract__crop__name,
          row.account__contract__farmer__farm_name,
          row.account__contract__company__company_name,
        ]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(term));
      });
  }, [rows, query, type, status]);

  const totalAmount = filtered.reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const pendingCount = rows.filter((row) => row.status === "PENDING").length;

  return (
    <div className="page-shell">
      <div className="container-page">
        <span className="eyebrow">Admin console</span>
        <h1 className="section-title">Payment ledger</h1>
        <p className="section-description">Review escrow funding and milestone releases with clear agreement context.</p>
        {error && <p className="mt-4 text-sm font-bold text-red-600">{error}</p>}

        {!loading && (
          <div className="metric-grid mt-8">
            <div className="metric-card"><p>Records shown</p><strong>{filtered.length}</strong></div>
            <div className="metric-card"><p>Amount shown</p><strong>{formatCurrency(totalAmount)}</strong></div>
            <div className="metric-card"><p>Pending settlements</p><strong>{pendingCount}</strong></div>
            <div className="metric-card"><p>Total records</p><strong>{rows.length}</strong></div>
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
          <select className="admin-select" value={type} onChange={(event) => setType(event.target.value)}>
            {TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <select className="admin-select" value={status} onChange={(event) => setStatus(event.target.value)}>
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>{option === "ALL" ? "All statuses" : option}</option>
            ))}
          </select>
          <span className="result-count">{filtered.length} of {rows.length}</span>
        </div>

        {loading ? (
          <p className="mt-8 text-sm font-bold text-slate-400">Loading payment records...</p>
        ) : filtered.length === 0 ? (
          <div className="empty-state mt-8">
            <strong>No payment records match your filters</strong>
            <p>Try clearing the search or choosing a different type.</p>
          </div>
        ) : (
          <div className="table-wrap mt-8">
            <table>
              <thead>
                <tr>
                  <th>Agreement</th>
                  <th>Farmer</th>
                  <th>Buyer</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id}>
                    <td>{row.account__contract__crop__name ? `${row.account__contract__crop__name} agreement` : "Agreement"}</td>
                    <td>{row.account__contract__farmer__farm_name || "—"}</td>
                    <td>{row.account__contract__company__company_name || "—"}</td>
                    <td>{formatTransactionType(row.transaction_type)}</td>
                    <td>{formatCurrency(row.amount)}</td>
                    <td><StatusBadge status={row.status} /></td>
                    <td>{new Date(row.created_at).toLocaleDateString()}</td>
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