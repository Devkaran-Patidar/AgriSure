import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api";
import StatusBadge from "../../components/common/StatusBadge";
import { formatCurrency, formatPaymentTitle, formatStatus } from "../../lib/display";

export default function FarmerPayments() {
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest("/payments/accounts/").then(setAccounts).catch((requestError) => setError(requestError.message));
  }, []);

  return (
    <div className="page-shell">
      <div className="container-page">
        <span className="eyebrow">Payments</span>
        <h1 className="section-title">Your payouts & escrow</h1>
        <p className="section-description">
          See milestone releases linked to each crop agreement — no internal contract IDs needed.
        </p>

        {error && <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600">{error}</p>}

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {accounts.length === 0 && !error && (
            <p className="text-slate-500">No escrow accounts are linked to your agreements yet.</p>
          )}
          {accounts.map((account) => (
            <article className="card" key={account.id}>
              <div className="flex justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Agreement</p>
                  <h2 className="payment-card-title">{formatPaymentTitle(account)}</h2>
                  <p className="mt-1 text-sm text-slate-500">Buyer: {account.company_name || "—"}</p>
                </div>
                <StatusBadge status={account.status} />
              </div>
              <p className="mt-4 text-sm text-slate-500">Escrow balance: {formatCurrency(account.total_amount)}</p>
              <div className="mt-5 grid gap-3">
                {account.milestones.map((milestone) => (
                  <div className="rounded-xl bg-soft p-4" key={milestone.id}>
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="font-bold text-navy">{milestone.name}</span>
                      <span>{formatCurrency(milestone.amount)}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{formatStatus(milestone.status)}</p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
