import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api";
import StatusBadge from "../../components/common/StatusBadge";
import { formatCurrency } from "../../lib/display";

export default function AdminContracts() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest("/admin/contracts/")
      .then(setRows)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-shell">
      <div className="container-page">
        <span className="eyebrow">Admin console</span>
        <h1 className="section-title">Agreement oversight</h1>
        <p className="section-description">Track crop agreements between farmers and buyers across the platform.</p>
        {error && <p className="mt-4 text-sm font-bold text-red-600">{error}</p>}
        {loading ? (
          <p className="mt-8 text-sm font-bold text-slate-400">Loading agreements...</p>
        ) : (
          <div className="table-wrap mt-8">
            <table>
              <thead>
                <tr>
                  <th>Agreement</th>
                  <th>Crop</th>
                  <th>Farmer</th>
                  <th>Buyer</th>
                  <th>Status</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr><td colSpan="6" className="text-center">No agreements found.</td></tr>
                ) : rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.crop__name ? `${row.crop__name} agreement` : "Agreement"}</td>
                    <td>{row.crop__name || "—"}</td>
                    <td>{row.farmer__farm_name || "—"}</td>
                    <td>{row.company__company_name || "—"}</td>
                    <td><StatusBadge status={row.status} /></td>
                    <td>{row.agreed_price ? formatCurrency(row.agreed_price) : "Pending"}</td>
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
