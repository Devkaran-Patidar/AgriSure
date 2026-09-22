import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiRequest } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import StatusBadge from "../../components/common/StatusBadge";
import { formatContractTitle, formatCurrency } from "../../lib/display";

export default function ContractDetail() {
  const { id } = useParams();
  const [contract, setContract] = useState(null);
  const [offers, setOffers] = useState([]);
  const [message, setMessage] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [actionPending, setActionPending] = useState("");
  const { user } = useAuth();

  const load = async () => {
    try {
      const [contractData, offerData] = await Promise.all([
        apiRequest(`/contracts/${id}/`),
        apiRequest(`/negotiations/?contract=${id}`),
      ]);
      setContract(contractData);
      setOffers(offerData);
    } catch (error) {
      setMessage(error.message);
    }
  };

  useEffect(() => { load(); }, [id]);

  const submitOffer = async (event) => {
    event.preventDefault();
    try {
      await apiRequest("/negotiations/", {
        method: "POST",
        body: JSON.stringify({ contract: Number(id), offered_price: offerPrice }),
      });
      setOfferPrice("");
      setMessage("Offer submitted.");
      await load();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const acceptOffer = async (offerId) => {
    try {
      await apiRequest(`/negotiations/${offerId}/accept/`, { method: "POST" });
      setMessage("Offer accepted.");
      await load();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const action = async (type) => {
    setActionPending(type);
    setMessage("");
    try {
      await apiRequest(`/contracts/${id}/${type}/`, { method: "POST" });
      setMessage(type === "approve" ? "Agreement approved." : "Agreement signed.");
      await load();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setActionPending("");
    }
  };

  const printContract = () => window.print();

  if (!contract) return <div className="grid min-h-[60vh] place-items-center">Loading...</div>;

  const title = formatContractTitle(contract);

  return (
    <section className="bg-soft py-10">
      <div className="container-page grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2 print-contract">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={contract.status} />
            {contract.fully_signed && <span className="status status-green">Fully signed</span>}
          </div>
          <h1 className="mt-4 font-heading text-3xl font-extrabold text-navy">{title}</h1>
          {contract.fully_signed && (
            <button className="btn-secondary mt-5 print-hide" onClick={printContract}>Print / Save signed PDF</button>
          )}
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {[
              ["Crop", contract.crop_details?.name || "—"],
              ["Quantity", contract.agreed_quantity],
              ["Price", contract.agreed_price ? formatCurrency(contract.agreed_price) : "Pending"],
              ["Farmer", contract.farmer_name],
              ["Buyer", contract.company_name],
              ["Created", new Date(contract.created_at).toLocaleDateString()],
              ["Delivery", contract.delivery_location || "Not specified"],
              ["Payment terms", contract.payment_terms || "Not specified"],
            ].map(([label, value]) => (
              <div className="rounded-2xl bg-soft p-4" key={label}>
                <p className="text-xs font-bold text-slate-400">{label}</p>
                <p className="mt-2 font-bold text-navy">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl bg-soft p-5">
            <h2 className="font-heading text-lg font-bold text-navy">Terms and conditions</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{contract.terms_conditions || "No terms added."}</p>
          </div>
          <div className="mt-6 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
            <p>Farmer approval: {contract.farmer_approved_at ? "Complete" : "Pending"}</p>
            <p>Buyer approval: {contract.company_approved_at ? "Complete" : "Pending"}</p>
            <p>Farmer signature: {contract.farmer_signed_at ? "Complete" : "Pending"}</p>
            <p>Buyer signature: {contract.company_signed_at ? "Complete" : "Pending"}</p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              className="btn-secondary"
              disabled={Boolean(actionPending) || Boolean(contract[`${user?.role === "FARMER" ? "farmer" : "company"}_approved_at`])}
              onClick={() => action("approve")}
            >
              {actionPending === "approve" ? "Approving..." : "Approve agreement"}
            </button>
            <button
              className="btn-primary"
              disabled={Boolean(actionPending) || Boolean(contract[`${user?.role === "FARMER" ? "farmer" : "company"}_signed_at`])}
              onClick={() => action("sign")}
            >
              {actionPending === "sign" ? "Signing..." : "Sign digital agreement"}
            </button>
          </div>
          {message && <p className="mt-4 text-sm font-bold text-primary">{message}</p>}
        </div>
        <div className="card">
          <h2 className="font-heading text-xl font-extrabold text-navy">Negotiation</h2>
          <form className="mt-5 grid gap-4" onSubmit={submitOffer}>
            <input className="input" type="number" min="0.01" step="0.01" placeholder="Offered price" value={offerPrice} onChange={(event) => setOfferPrice(event.target.value)} required />
            <button className="btn-primary">Submit offer</button>
          </form>
          <h3 className="mt-8 font-heading font-bold text-navy">Offer history</h3>
          <div className="mt-4 grid gap-3">
            {offers.length === 0 && <p className="text-sm text-slate-500">No offers yet.</p>}
            {offers.map((item) => (
              <div className="rounded-xl bg-soft p-4 text-sm" key={item.id}>
                <b>{formatCurrency(item.offered_price)}</b> · {item.status}
                {item.status === "PENDING" && (
                  <button className="mt-3 block text-sm font-bold text-primary" onClick={() => acceptOffer(item.id)}>Accept offer</button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
