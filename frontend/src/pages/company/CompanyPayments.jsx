import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { apiRequest } from "../../lib/api";
import StatusBadge from "../../components/common/StatusBadge";
import { formatCurrency, formatPaymentTitle, formatStatus, formatTransactionType } from "../../lib/display";

export default function CompanyPayments() {
  const [searchParams] = useSearchParams();
  const [accounts, setAccounts] = useState([]);
  const [amounts, setAmounts] = useState({});
  const [error, setError] = useState("");
  const selectedContractId = searchParams.get("contract");

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

  const releaseAdvance = async (contractId) => {
    try {
      await apiRequest(`/payments/contracts/${contractId}/advance/`, { method: "POST" });
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
        <h1 className="section-title">Payment workspace</h1>
        <p className="section-description">
          Review the full contract value, fund escrow once, then release the 20% advance and 80% delivery balance as each milestone is completed.
        </p>

        {error && <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600">{error}</p>}

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {accounts.length === 0 && !error && (
            <p className="text-slate-500">Create an agreement to open an escrow account.</p>
          )}
          {accounts.map((account) => (
            <article className={`card ${String(account.contract_id) === String(selectedContractId) ? "ring-2 ring-primary" : ""}`} key={account.id}>
              <div className="flex justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Agreement</p>
                  <h2 className="payment-card-title">{formatPaymentTitle(account)}</h2>
                  <p className="mt-1 text-sm text-slate-500">Farmer: {account.farmer_name || "—"}</p>
                </div>
                <StatusBadge status={account.status} />
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <PaymentSummary label="Total contract" value={formatCurrency(account.total_amount)} />
                <PaymentSummary label="20% advance" value={formatCurrency(account.milestones.find((milestone) => milestone.sequence === 1)?.amount)} />
                <PaymentSummary label="80% after delivery" value={formatCurrency(account.milestones.find((milestone) => milestone.sequence === 2)?.amount)} />
              </div>
              {account.status === "UNFUNDED" && <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <input
                  className="input"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder={`Enter ${formatCurrency(account.total_amount)}`}
                  value={amounts[account.id] ?? account.total_amount ?? ""}
                  onChange={(event) => setAmounts({ ...amounts, [account.id]: event.target.value })}
                />
                <button className="btn-primary" onClick={() => fund(account.id)}>Fund full escrow</button>
              </div>}
              <p className="mt-4 text-sm text-slate-500">{account.milestones.length} payment milestones configured</p>
              <div className="mt-5 grid gap-2 text-sm text-slate-600">
                {account.transactions.map((transaction) => (
                  <p key={transaction.id}>
                    {formatTransactionType(transaction.transaction_type)}: {formatCurrency(transaction.amount)} ({formatStatus(transaction.status)})
                  </p>
                ))}
                {account.milestones.filter((milestone) => milestone.sequence === 1).map((milestone) => (
                  <button className="btn-secondary mt-2 disabled:cursor-not-allowed disabled:opacity-50" disabled={milestone.status !== "FUNDED"} key={milestone.id} onClick={() => releaseAdvance(account.contract_id)}>
                    {milestone.status === "RELEASED" ? "20% advance released" : milestone.status === "FUNDED" ? `Release 20% advance (${formatCurrency(milestone.amount)})` : "Fund escrow to enable 20% advance"}
                  </button>
                ))}
                {account.milestones.filter((milestone) => milestone.sequence === 2).map((milestone) => (
                  <button className="btn-secondary mt-2 disabled:cursor-not-allowed disabled:opacity-50" disabled={milestone.status !== "FUNDED" || account.contract_status !== "COMPLETED"} key={milestone.id} onClick={() => release(milestone.id)}>
                    {milestone.status === "RELEASED" ? "80% final payment released" : account.contract_status === "COMPLETED" && milestone.status === "FUNDED" ? `Release 80% after delivery (${formatCurrency(milestone.amount)})` : "80% release available after farmer delivery"}
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

function PaymentSummary({ label, value }) {
  return <div className="rounded-xl bg-soft p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 font-heading text-lg font-extrabold text-navy">{value || "—"}</p></div>;
}
