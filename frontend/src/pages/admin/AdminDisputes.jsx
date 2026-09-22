import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api";
import StatusBadge from "../../components/common/StatusBadge";

export default function AdminDisputes() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest("/admin/disputes/")
      .then(setRows)
      .catch((requestError) => setError(requestError.message));
  }, []);

  return (
    <div className="page-shell">
      <div className="container-page">
        <span className="eyebrow">Admin console</span>
        <h1 className="section-title">Dispute queue</h1>
        <p className="section-description">Review reported issues with clear agreement context instead of internal IDs.</p>
        {error && <p className="mt-4 text-sm font-bold text-red-600">{error}</p>}
        {rows.length === 0 ? (
          <p className="mt-8 text-slate-500">No disputes reported.</p>
        ) : (
          <div className="mt-8 grid gap-4">
            {rows.map((row) => (
              <article className="card" key={row.id}>
                <div className="flex justify-between gap-4">
                  <h2 className="font-heading text-lg font-bold text-navy">{row.title}</h2>
                  <StatusBadge status={row.status} />
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  {row.contract__crop__name || "Agreement"} · {row.contract__farmer__farm_name || "Farmer"} ↔ {row.contract__company__company_name || "Buyer"} · Priority {row.priority}
                </p>
                <p className="mt-3 text-sm text-slate-700">{row.description}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
