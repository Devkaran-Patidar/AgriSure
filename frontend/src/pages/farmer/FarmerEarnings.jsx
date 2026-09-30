import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api";
import { useLanguage } from "../../context/LanguageContext";

export default function FarmerEarnings() {
  const { t } = useLanguage();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => { apiRequest("/payments/summary/").then(setSummary).catch((e) => setError(e.message)); }, []);
  return (
    <section className="section-padding">
      <div className="container-page">
        <span className="eyebrow">{t("earnings")}</span>
        <h1 className="section-title">{t("farmerEarnings")}</h1>
        <p className="section-description">{t("earningsDescription")}</p>

        {error && <p className="mt-6 text-sm font-bold text-red-600">{error}</p>}
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <Summary label={t("totalReleased")} value={`INR ${summary?.released_amount ?? "-"}`} />
          <Summary label={t("pending")} value={`INR ${summary?.pending_amount ?? "-"}`} />
          <Summary label={t("escrowAccounts")} value={summary?.accounts ?? "-"} />
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
