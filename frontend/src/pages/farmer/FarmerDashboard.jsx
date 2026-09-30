import { Link } from "react-router-dom";
import { ArrowRight, Sprout, WalletCards } from "lucide-react";
import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api";
import { useLanguage } from "../../context/LanguageContext";

export default function FarmerDashboard() {
  const { t } = useLanguage();
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
        <span className="eyebrow">{t("farmerDashboard")}</span>
        {/* <h1 className="section-title">{t("farmerWorkspaceTitle")}</h1> */}
        <p className="section-description text-2xl font-bold font-heading text-black-400">
          {t("farmerWorkspaceDescription")}
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <Card title={t("activeContracts")} value={contracts.filter((contract) => ["ACTIVE", "AGREED"].includes(contract.status)).length} />
          <Card title={t("pendingPayments")} value={`INR ${summary?.pending_amount ?? "-"}`} />
          <Card title={t("escrowAccounts")} value={summary?.accounts ?? "-"} />
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1.4fr_.9fr]">
          <div className="card dashboard-feature"><div className="icon-box"><Sprout size={22} /></div><div><p className="eyebrow mt-5">{t("nextBestAction")}</p><h2 className="mt-4 font-heading text-2xl font-extrabold text-navy">{t("cropCommitments")}</h2><p className="mt-2 max-w-xl text-sm leading-7 text-slate-500">{t("cropCommitmentsDescription")}</p><Link to="/farmer/contracts" className="btn-primary mt-5">{t("reviewContracts")} <ArrowRight size={16} /></Link></div></div>
          <div className="card"><div className="flex items-center gap-3"><div className="icon-box"><WalletCards size={20} /></div><div><h2 className="font-heading text-lg font-extrabold text-navy">{t("yourWorkspace")}</h2><p className="text-xs text-slate-500">{t("essentialsClose")}</p></div></div><div className="mt-6 grid gap-3">{[[t("addCrop"), "/farmer/crops"], [t("updateProgress"), "/farmer/crop-progress"], [t("checkPayouts"), "/farmer/payments"]].map(([label, to]) => <Link key={to} to={to} className="quick-link">{label}<ArrowRight size={15} /></Link>)}</div></div>
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
