import { Link } from "react-router-dom";
import { ArrowRight, Sprout, WalletCards } from "lucide-react";
import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api";

export default function FarmerDashboard() {
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
        <span className="eyebrow">Farmer Dashboard</span>
        <h1 className="section-title">Welcome to your farming workspace</h1>
        <p className="section-description">
          Track contracts, crop progress, payouts, messages, and notifications in one place.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <Card title="Active Contracts" value={contracts.filter((contract) => ["ACTIVE", "AGREED"].includes(contract.status)).length} />
          <Card title="Pending Payments" value={`INR ${summary?.pending_amount ?? "-"}`} />
          <Card title="Escrow Accounts" value={summary?.accounts ?? "-"} />
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1.4fr_.9fr]">
          <div className="card dashboard-feature"><div className="icon-box"><Sprout size={22} /></div><div><p className="eyebrow mt-5">Next best action</p><h2 className="mt-4 font-heading text-2xl font-extrabold text-navy">Keep your crop commitments moving</h2><p className="mt-2 max-w-xl text-sm leading-7 text-slate-500">Review incoming buyer requests, approve agreed terms, and keep progress updates visible to your partners.</p><Link to="/farmer/contracts" className="btn-primary mt-5">Review contracts <ArrowRight size={16} /></Link></div></div>
          <div className="card"><div className="flex items-center gap-3"><div className="icon-box"><WalletCards size={20} /></div><div><h2 className="font-heading text-lg font-extrabold text-navy">Your workspace</h2><p className="text-xs text-slate-500">Keep the essentials close</p></div></div><div className="mt-6 grid gap-3">{[["Add a crop", "/farmer/crops"], ["Update progress", "/farmer/crop-progress"], ["Check payouts", "/farmer/payments"]].map(([label, to]) => <Link key={to} to={to} className="quick-link">{label}<ArrowRight size={15} /></Link>)}</div></div>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="card">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{title}</p>
      <p className="mt-3 font-heading text-2xl font-extrabold text-navy">{value}</p>
    </div>
  );
}
