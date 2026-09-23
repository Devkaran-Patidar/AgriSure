import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../lib/api";
import ContractCard from "../../components/contracts/ContractCard";

export default function FarmerContracts() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [decisionId, setDecisionId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = () => apiRequest("/contracts/")
    .then(setContracts)
    .catch((requestError) => setError(requestError.message))
    .finally(() => setLoading(false));

  const requestContracts = contracts.filter((contract) => contract.status === "DRAFT");
  const negotiationContracts = contracts.filter((contract) => ["NEGOTIATING", "AGREED"].includes(contract.status));
  const agreedContracts = contracts.filter((contract) => contract.status === "AGREED");
  const runningContracts = contracts.filter((contract) => contract.status === "ACTIVE");
  const completedContracts = contracts.filter((contract) => contract.status === "COMPLETED");

  const decideRequest = async (id, decision) => {
    setDecisionId(id);
    setError("");
    try {
      await apiRequest(`/contracts/${id}/${decision}/`, { method: "POST" });
      if (decision === "approve") {
        navigate(`/farmer/contracts/${id}`);
        return;
      }
      await loadContracts();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setDecisionId(null);
    }
  };

  const formatNegotiationPrice = (value) => {
    if (value === null || value === undefined || value === "") {
      return "Waiting for price negotiation";
    }

    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) return value;

    return `INR ${numericValue.toLocaleString("en-IN")}`;
  };

  return (
    <div className="page-shell">
      <div className="container-page">
        <span className="eyebrow">Agreements</span>
        <h1 className="section-title">Your crop agreements</h1>
        <p className="section-description">Review buyer requests, negotiate the price, and track agreements from acceptance to delivery.</p>

        {error && <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600">{error}</div>}

        {loading ? (
          <p className="mt-8 font-bold text-slate-400">Loading agreements...</p>
        ) : contracts.length === 0 ? (
          <div className="mt-8 rounded-2xl border-2 border-dashed border-slate-300 p-10 text-center">
            <h3 className="font-heading text-xl font-bold text-navy">No agreements yet</h3>
            <p className="mt-2 text-slate-500">Buyers will send requests based on your listed crops.</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-10">
            <RequestSection
              contracts={requestContracts}
              decisionId={decisionId}
              onDecision={decideRequest}
              formatPrice={formatNegotiationPrice}
            />
            <NegotiationSection
              title="Negotiation price"
              contracts={negotiationContracts}
              empty="No active negotiations yet."
              formatPrice={formatNegotiationPrice}
            />
            <ContractSection title="Agreed contracts" contracts={agreedContracts} role="farmer" empty="No agreed contracts yet." />
            <ContractSection title="Running contracts" contracts={runningContracts} role="farmer" empty="No contracts are currently running." />
            <ContractSection title="Completed after delivery" contracts={completedContracts} role="farmer" signed empty="No completed deliveries yet." />
          </div>
        )}
      </div>
    </div>
  );
}

function RequestSection({ contracts, decisionId, onDecision, formatPrice }) {
  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-heading text-2xl font-extrabold text-navy">Review buyer requests</h2>
          <p className="mt-1 text-sm text-slate-500">Accept a request to open negotiation, or decline it if the terms are not suitable.</p>
        </div>
        <span className="status status-yellow">{contracts.length} pending</span>
      </div>
      {contracts.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">No new buyer requests.</p>
      ) : (
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          {contracts.map((contract) => (
            <article className="card" key={contract.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Buyer request</p>
                  <h3 className="mt-1 font-heading text-xl font-extrabold text-navy">{contract.crop_details?.name || "Crop agreement"}</h3>
                  <p className="mt-1 text-sm text-slate-500">{contract.company_name || contract.company_details?.company_name || "Buyer"}</p>
                </div>
                <span className="status status-yellow">Pending</span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <Info label="Quantity" value={`${contract.agreed_quantity} quintals`} />
                <Info label="Negotiation price" value={formatPrice(contract.agreed_price)} />
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <button className="btn-primary" disabled={decisionId === contract.id} onClick={() => onDecision(contract.id, "approve")}>
                  {decisionId === contract.id ? "Saving..." : "Accept & negotiate"}
                </button>
                <button className="btn-secondary" disabled={decisionId === contract.id} onClick={() => onDecision(contract.id, "reject")}>Decline</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function NegotiationSection({ title, contracts, empty, formatPrice }) {
  return (
    <section>
      <h2 className="font-heading text-2xl font-extrabold text-navy">{title}</h2>
      {contracts.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">{empty || "No negotiation prices yet."}</p>
      ) : (
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          {contracts.map((contract) => (
            <article className="card" key={contract.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Negotiation</p>
                  <h3 className="mt-1 font-heading text-xl font-extrabold text-navy">{contract.crop_details?.name || "Crop agreement"}</h3>
                  <p className="mt-1 text-sm text-slate-500">{contract.company_name || contract.company_details?.company_name || "Buyer"}</p>
                </div>
                <span className="status status-blue">{contract.status}</span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <Info label="Quantity" value={`${contract.agreed_quantity} quintals`} />
                <Info label="Negotiation price" value={formatPrice(contract.agreed_price)} />
              </div>
              <div className="mt-5">
                <button className="btn-secondary" onClick={() => window.location.assign(`/farmer/contracts/${contract.id}`)}>
                  View details
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function ContractSection({ title, contracts, role, signed, empty }) {
  if (title === "Running contracts") {
    return (
      <section>
        <h2 className="font-heading text-2xl font-extrabold text-navy">{title}</h2>
        {contracts.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">{empty || "No active contracts yet."}</p>
        ) : (
          <div className="mt-4 grid gap-5">
            {contracts.map((contract) => (
              <RunningContractCard key={contract.id} contract={contract} role={role} />
            ))}
          </div>
        )}
      </section>
    );
  }

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

function RunningContractCard({ contract, role }) {
  const [actionPending, setActionPending] = useState("");
  const [notice, setNotice] = useState("");

  const farmerDetails = contract.farmer_details || {};
  const buyerDetails = contract.company_details || {};
  const buyerRecipientId = buyerDetails.id || contract.company_id || contract.company;
  const finalPaymentValue = Number(contract.agreed_price || 0) * Number(contract.agreed_quantity || 0);

  const sendCommunication = async (subject, body) => {
    if (!buyerRecipientId) {
      setNotice("Buyer contact is not available for this message.");
      return;
    }

    await apiRequest("/communications/messages/", {
      method: "POST",
      body: JSON.stringify({
        recipient: Number(buyerRecipientId),
        subject,
        body,
      }),
    });
  };

  const handleDeliverCrop = async () => {
    setActionPending("deliver");
    setNotice("");
    try {
      const deliveryMessage = `${contract.crop_details?.name || "Crop"} has been delivered to ${contract.delivery_location || "the agreed delivery point"}. Please confirm receipt and complete the final payment process.`;
      await sendCommunication(`Delivery update for contract #${contract.id}`, deliveryMessage);
      setNotice("Delivery update sent to buyer");
    } catch (error) {
      setNotice(error.message || "Unable to send delivery update.");
    } finally {
      setActionPending("");
    }
  };

  const handleFinalPaymentNote = async () => {
    setActionPending("payment");
    setNotice("");
    try {
      const paymentMessage = `Final payment for contract #${contract.id} is ready for release. Total agreed value: INR ${finalPaymentValue.toLocaleString("en-IN")}. Please confirm final delivery and complete the payment release.`;
      await sendCommunication(`Final payment release communication for contract #${contract.id}`, paymentMessage);
      setNotice("Final payment release message sent");
    } catch (error) {
      setNotice(error.message || "Unable to send the final payment note.");
    } finally {
      setActionPending("");
    }
  };

  return (
    <article className="card">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Running agreement</p>
          <h3 className="mt-1 font-heading text-xl font-extrabold text-navy">{contract.crop_details?.name || "Crop agreement"}</h3>
        </div>
        <span className="status status-green">{contract.status}</span>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-soft p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Farmer details</p>
          <p className="mt-3 font-bold text-navy">{farmerDetails.name || "Farmer"}</p>
          <p className="mt-1 text-sm text-slate-600">{farmerDetails.farm_name || "Farm name not available"}</p>
          <p className="mt-1 text-sm text-slate-600">{farmerDetails.email || "Email not available"}</p>
        </div>

        <div className="rounded-2xl bg-soft p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Buyer details</p>
          <p className="mt-3 font-bold text-navy">{buyerDetails.name || "Buyer"}</p>
          <p className="mt-1 text-sm text-slate-600">{buyerDetails.company_name || "Company name not available"}</p>
          <p className="mt-1 text-sm text-slate-600">{buyerDetails.email || "Email not available"}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Info label="Quantity" value={`${contract.agreed_quantity || "—"} quintals`} />
        <Info label="Negotiated price" value={contract.agreed_price ? `INR ${Number(contract.agreed_price).toLocaleString("en-IN")}` : "Waiting for price"} />
        <Info label="Delivery date" value={contract.delivery_date || "Not set yet"} />
        <Info label="Agreement value" value={`INR ${finalPaymentValue.toLocaleString("en-IN")}`} />
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <Info label="Delivery location" value={contract.delivery_location || "Not specified"} />
        <Info label="Payment terms" value={contract.payment_terms || "Not specified"} />
      </div>

      <div className="mt-6 rounded-2xl bg-soft p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Agreement notes</p>
        <p className="mt-2 text-sm text-slate-700">{contract.terms_conditions || "No additional agreement notes were added."}</p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button className="btn-primary" disabled={actionPending !== ""} onClick={handleDeliverCrop}>
          {actionPending === "deliver" ? "Sending..." : "Deliver crop"}
        </button>
        <button className="btn-secondary" disabled={actionPending !== ""} onClick={handleFinalPaymentNote}>
          {actionPending === "payment" ? "Sending..." : "Final payment release communication"}
        </button>
      </div>

      {notice && <p className="mt-4 text-sm font-bold text-primary">{notice}</p>}
    </article>
  );
}

function Info({ label, value }) {
  return <div className="rounded-xl bg-soft p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 font-bold text-navy">{value}</p></div>;
}
