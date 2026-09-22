import { useState, useEffect } from "react";
import { apiRequest } from "../../lib/api";
import ContractCard from "../../components/contracts/ContractCard";

export default function CompanyContracts() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest("/contracts/")
      .then(setContracts)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-shell">
      <div className="container-page">
        <span className="eyebrow">Agreements</span>
        <h1 className="section-title">Your procurement agreements</h1>
        <p className="section-description">Track sourcing agreements from request to signed contract.</p>

        {error && <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600">{error}</div>}

        {loading ? (
          <p className="mt-8 font-bold text-slate-400">Loading agreements...</p>
        ) : contracts.length === 0 ? (
          <div className="mt-8 rounded-2xl border-2 border-dashed border-slate-300 p-10 text-center">
            <h3 className="font-heading text-xl font-bold text-navy">No agreements yet</h3>
            <p className="mt-2 text-slate-500">Find crops and send agreement requests to get started.</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-10">
            <ContractSection title="In progress" contracts={contracts.filter((contract) => !contract.fully_signed)} role="company" empty="No active procurements." />
            <ContractSection title="Signed agreements" contracts={contracts.filter((contract) => contract.fully_signed)} role="company" signed />
          </div>
        )}
      </div>
    </div>
  );
}

function ContractSection({ title, contracts, role, signed, empty }) {
  return (
    <section>
      <h2 className="font-heading text-2xl font-extrabold text-navy">{title}</h2>
      {contracts.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">{empty || "No signed agreements yet."}</p>
      ) : (
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          {contracts.map((contract) => (
            <ContractCard key={contract.id} contract={contract} role={role} signed={signed} />
          ))}
        </div>
      )}
    </section>
  );
}
