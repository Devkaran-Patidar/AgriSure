import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api";

export default function FarmerEarnings() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => { apiRequest("/payments/summary/").then(setSummary).catch((e) => setError(e.message)); }, []);
  return (
    <section className="section-padding">
      <div className="container-page">
        <span className="eyebrow">Earnings</span>
        <h1 className="section-title">Farmer Earnings</h1>
        <p className="section-description">Summary of settled and pending payouts linked to active contracts.</p>

        {error && <p className="mt-6 text-sm font-bold text-red-600">{error}</p>}
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <Summary label="Total released" value={`INR ${summary?.released_amount ?? "-"}`} />
          <Summary label="Pending" value={`INR ${summary?.pending_amount ?? "-"}`} />
          <Summary label="Escrow accounts" value={summary?.accounts ?? "-"} />
        </div>
      </div>
    </section>
  );
}

function Summary({ label, value }) {
  return (
    <div className="card">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-3 font-heading text-3xl font-extrabold text-navy">{value}</p>
    </div>
  );
}
