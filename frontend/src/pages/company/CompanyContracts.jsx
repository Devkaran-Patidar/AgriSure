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

  const requestContracts = contracts.filter((contract) => contract.status === "DRAFT");
  const negotiationContracts = contracts.filter((contract) => ["NEGOTIATING", "AGREED"].includes(contract.status));
  const runningContracts = contracts.filter((contract) => contract.status === "ACTIVE");
  const completedContracts = contracts.filter((contract) => contract.status === "COMPLETED");

  return (
    <div className="page-shell">
      <div className="container-page">
        <span className="eyebrow">Agreements</span>
        <h1 className="section-title">Your procurement agreements</h1>
        <p className="section-description">Track sourcing agreements from request to signed delivery and final payment flow.</p>

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
            <RequestSection contracts={requestContracts} title="Incoming requests" />
            <NegotiationSection contracts={negotiationContracts} title="Negotiation and agreed price" />
            <ContractSection title="Running contracts" contracts={runningContracts} role="company" empty="No active procurements." />
            <ContractSection title="Completed after delivery" contracts={completedContracts} role="company" signed empty="No completed deliveries yet." />
          </div>
        )}
      </div>
    </div>
  );
}

function RequestSection({ contracts, title }) {
  return (
    <section>
      <h2 className="font-heading text-2xl font-extrabold text-navy">{title}</h2>
      {contracts.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">No contract requests yet.</p>
      ) : (
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          {contracts.map((contract) => (
            <article className="card" key={contract.id}>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Buyer request</p>
              <h3 className="mt-1 font-heading text-xl font-extrabold text-navy">{contract.crop_details?.name || "Crop agreement"}</h3>
              <p className="mt-1 text-sm text-slate-500">{contract.farmer_name || contract.farmer_details?.farm_name || "Farmer"}</p>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <Info label="Quantity" value={`${contract.agreed_quantity} quintals`} />
                <Info label="Price" value={contract.agreed_price ? `INR ${Number(contract.agreed_price).toLocaleString("en-IN")}` : "Pending negotiation"} />
              </div>
              <div className="mt-5">
                <a className="btn-secondary" href={`/company/contracts/${contract.id}`}>Review request</a>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function NegotiationSection({ contracts, title }) {
  return (
    <section>
      <h2 className="font-heading text-2xl font-extrabold text-navy">{title}</h2>
      {contracts.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">No negotiation or agreed contract prices yet.</p>
      ) : (
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          {contracts.map((contract) => (
            <article className="card" key={contract.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Negotiation</p>
                  <h3 className="mt-1 font-heading text-xl font-extrabold text-navy">{contract.crop_details?.name || "Crop agreement"}</h3>
                  <p className="mt-1 text-sm text-slate-500">{contract.farmer_name || contract.farmer_details?.farm_name || "Farmer"}</p>
                </div>
                <span className="status status-blue">{contract.status}</span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <Info label="Quantity" value={`${contract.agreed_quantity} quintals`} />
                <Info label="Price" value={contract.agreed_price ? `INR ${Number(contract.agreed_price).toLocaleString("en-IN")}` : "Waiting for price"} />
              </div>
              <div className="mt-5">
                <a className="btn-secondary" href={`/company/contracts/${contract.id}`}>View agreement</a>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
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

function Info({ label, value }) {
  return <div className="rounded-xl bg-soft p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 font-bold text-navy">{value}</p></div>;
}
