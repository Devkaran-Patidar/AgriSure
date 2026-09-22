import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api";
import StatusBadge from "../../components/common/StatusBadge";
import { formatCurrency, formatPaymentTitle, formatStatus, formatTransactionType } from "../../lib/display";

export default function CompanyPayments() {
  const [accounts, setAccounts] = useState([]);
  const [amounts, setAmounts] = useState({});
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setAccounts(await apiRequest("/payments/accounts/"));
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  useEffect(() => { load(); }, []);

  const fund = async (accountId) => {
    try {
      await apiRequest(`/payments/accounts/${accountId}/fund/`, {
        method: "POST",
        body: JSON.stringify({ amount: amounts[accountId] }),
      });
      await load();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const release = async (milestoneId) => {
    try {
      await apiRequest(`/payments/milestones/${milestoneId}/release/`, { method: "POST" });
      await load();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="page-shell">
      <div className="container-page">
        <span className="eyebrow">Payments</span>
        <h1 className="section-title">Fund agreement escrow</h1>
        <p className="section-description">
          Add funds and release milestones for each crop agreement with clear farmer and crop details.
        </p>

        {error && <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600">{error}</p>}

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {accounts.length === 0 && !error && (
            <p className="text-slate-500">Create an agreement to open an escrow account.</p>
          )}
          {accounts.map((account) => (
            <article className="card" key={account.id}>
              <div className="flex justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Agreement</p>
                  <h2 className="payment-card-title">{formatPaymentTitle(account)}</h2>
                  <p className="mt-1 text-sm text-slate-500">Farmer: {account.farmer_name || "—"}</p>
                </div>
                <StatusBadge status={account.status} />
              </div>
              <p className="mt-4 text-sm text-slate-500">{account.milestones.length} milestone(s) configured</p>
              <div className="mt-5 flex gap-3">
                <input
                  className="input"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Funding amount"
                  value={amounts[account.id] || ""}
                  onChange={(event) => setAmounts({ ...amounts, [account.id]: event.target.value })}
                />
                <button className="btn-primary" onClick={() => fund(account.id)}>Fund escrow</button>
              </div>
              <div className="mt-5 grid gap-2 text-sm text-slate-600">
                {account.transactions.map((transaction) => (
                  <p key={transaction.id}>
                    {formatTransactionType(transaction.transaction_type)}: {formatCurrency(transaction.amount)} ({formatStatus(transaction.status)})
                  </p>
                ))}
                {account.milestones.filter((milestone) => milestone.status === "FUNDED").map((milestone) => (
                  <button className="btn-secondary mt-2" key={milestone.id} onClick={() => release(milestone.id)}>
                    Release {milestone.name}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
