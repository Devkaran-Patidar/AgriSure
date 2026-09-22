import { Link } from "react-router-dom";
import { ArrowRight, FileSearch, HandCoins } from "lucide-react";
import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api";

export default function CompanyDashboard() {
  const [summary, setSummary] = useState(null);
  const [contracts, setContracts] = useState([]);

  useEffect(() => {
    Promise.all([apiRequest("/payments/summary/"), apiRequest("/contracts/")])
      .then(([paymentSummary, contractList]) => { setSummary(paymentSummary); setContracts(contractList); })
      .catch(() => {});
  }, []);

  return (
    <div className="page-shell">
      <div className="container-page">
        <span className="eyebrow">Company Dashboard</span>
        <h1 className="section-title">Procurement control center</h1>
        <p className="section-description">Monitor sourcing pipeline, contracts, negotiations, and farmer communications.</p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <Card title="Open Requests" value={contracts.filter((contract) => contract.status === "DRAFT").length} />
          <Card title="Active Contracts" value={contracts.filter((contract) => ["ACTIVE", "AGREED"].includes(contract.status)).length} />
          <Card title="Funded Escrow" value={`INR ${summary?.funded_amount ?? "-"}`} />
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1.4fr_.9fr]">
          <div className="card dashboard-feature"><div className="icon-box"><FileSearch size={22} /></div><div><p className="eyebrow mt-5">Procurement pipeline</p><h2 className="mt-4 font-heading text-2xl font-extrabold text-navy">Source with confidence</h2><p className="mt-2 max-w-xl text-sm leading-7 text-slate-500">Discover available crops, send a contract request, and move the conversation through negotiation to a signed agreement.</p><Link to="/company/find-farmers" className="btn-primary mt-5">Find available crops <ArrowRight size={16} /></Link></div></div>
          <div className="card"><div className="flex items-center gap-3"><div className="icon-box"><HandCoins size={20} /></div><div><h2 className="font-heading text-lg font-extrabold text-navy">Quick access</h2><p className="text-xs text-slate-500">Your active buying work</p></div></div><div className="mt-6 grid gap-3">{[["Review requests", "/company/procurement"], ["Open negotiations", "/company/negotiations"], ["Fund payments", "/company/payments"]].map(([label, to]) => <Link key={to} to={to} className="quick-link">{label}<ArrowRight size={15} /></Link>)}</div></div>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="card">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{title}</p>
      <p className="mt-3 font-heading text-3xl font-extrabold text-navy">{value}</p>
    </div>
  );
}
