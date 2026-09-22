import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api";

export default function Negotiations() {
  const [offers, setOffers] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => { apiRequest("/negotiations/").then(setOffers).catch((e) => setError(e.message)); }, []);
  return (
    <section className="section-padding bg-soft">
      <div className="container-page">
        <span className="eyebrow">Negotiations</span>
        <h1 className="section-title">Negotiation Workspace</h1>

        {error && <p className="mt-6 text-sm font-bold text-red-600">{error}</p>}
        <div className="mt-8 grid gap-4">{offers.length === 0 ? <div className="card"><p className="text-sm text-slate-500">No negotiation offers yet. Start from a contract.</p></div> : offers.map((offer) => <div className="card flex flex-wrap items-center justify-between gap-4" key={offer.id}><div><Link to={`/company/contracts/${offer.contract}`} className="font-heading text-lg font-bold text-navy">Contract #{offer.contract}</Link><p className="mt-2 text-sm text-slate-500">Offer: INR {offer.offered_price}</p><p className="mt-1 text-sm text-slate-500">By {offer.offered_by_name || "participant"}</p></div><span className={`status ${offer.status === "ACCEPTED" ? "status-green" : offer.status === "REJECTED" ? "status-red" : "status-yellow"}`}>{offer.status}</span></div>)}</div>
      </div>
    </section>
  );
}
