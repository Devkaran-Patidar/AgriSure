import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api";
import StatusBadge from "../../components/common/StatusBadge";
import { formatCurrency, formatTransactionType } from "../../lib/display";

export default function AdminPayments() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest("/admin/payments/")
      .then(setRows)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-shell">
      <div className="container-page">
        <span className="eyebrow">Admin console</span>
        <h1 className="section-title">Payment ledger</h1>
        <p className="section-description">Review escrow funding and milestone releases with clear agreement context.</p>
        {error && <p className="mt-4 text-sm font-bold text-red-600">{error}</p>}
        {loading ? (
          <p className="mt-8 text-sm font-bold text-slate-400">Loading payment records...</p>
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
                {rows.length === 0 ? (
                  <tr><td colSpan="7" className="text-center">No payment records found.</td></tr>
                ) : rows.map((row) => (
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
