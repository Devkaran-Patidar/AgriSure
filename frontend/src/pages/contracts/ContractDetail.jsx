import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import StatusBadge from "../../components/common/StatusBadge";
import { formatContractTitle, formatCurrency } from "../../lib/display";
import contractPdf from "../../assets/documents/AgriSure_Digital_Crop_Contract_Agreement.pdf";

export default function ContractDetail() {
  const { id } = useParams();
  const [contract, setContract] = useState(null);
  const [offers, setOffers] = useState([]);
  const [message, setMessage] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [actionPending, setActionPending] = useState("");
  const [advancePending, setAdvancePending] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

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

  useEffect(() => {
    load();
  }, [id]);

  const submitOffer = async (event) => {
    event.preventDefault();

    try {
      await apiRequest("/negotiations/", {
        method: "POST",
        body: JSON.stringify({
          contract: Number(id),
          offered_price: offerPrice,
        }),
      });

      setOfferPrice("");
      setMessage("Offer submitted successfully.");
      await load();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const acceptOffer = async (offerId) => {
    try {
      await apiRequest(`/negotiations/${offerId}/accept/`, {
        method: "POST",
      });

      setMessage("Offer accepted successfully.");
      await load();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const rejectOffer = async (offerId) => {
    setActionPending(`reject-offer-${offerId}`);
    try {
      await apiRequest(`/negotiations/${offerId}/reject/`, { method: "POST" });
      setMessage("Offer rejected.");
      await load();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setActionPending("");
    }
  };

  const deleteOffer = async (offerId) => {
    setActionPending(`delete-offer-${offerId}`);
    try {
      await apiRequest(`/negotiations/${offerId}/`, { method: "DELETE" });
      setOffers((current) => current.filter((offer) => offer.id !== offerId));
      setMessage("Offer deleted.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setActionPending("");
    }
  };

  const action = async (type) => {
    setActionPending(type);
    setMessage("");

    try {
      await apiRequest(`/contracts/${id}/${type}/`, {
        method: "POST",
      });

      setMessage(
        type === "approve"
          ? "Agreement approved successfully."
          : type === "sign"
            ? "Agreement signed successfully."
            : "Delivery recorded successfully."
      );

      await load();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setActionPending("");
    }
  };

  const releaseFinalPayment = async () => {
    const finalMilestone =
      contract.payment_milestones?.find(
        (item) => item.sequence === 2 && item.status !== "RELEASED"
      ) || null;

    if (!finalMilestone) {
      setMessage("No final milestone is available for payment release yet.");
      return;
    }

    setActionPending("release-final");
    setMessage("");

    try {
      await apiRequest(
        `/payments/milestones/${finalMilestone.id}/release/`,
        {
          method: "POST",
        }
      );

      setMessage("Final payment released successfully.");
      await load();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setActionPending("");
    }
  };

  const payAdvance = async () => {
    setAdvancePending(true);
    navigate(`/company/payments?contract=${id}`);
    setAdvancePending(false);
  };

  if (!contract) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
          <p className="mt-3 text-sm font-medium text-slate-500">
            Loading contract...
          </p>
        </div>
      </div>
    );
  }

  const title = formatContractTitle(contract);

  const contractLocked =
    contract.fully_signed ||
    ["ACTIVE", "COMPLETED"].includes(contract.status);

  const userApprovalField =
    user?.role === "FARMER"
      ? "farmer_approved_at"
      : "company_approved_at";

  const userSignatureField =
    user?.role === "FARMER"
      ? "farmer_signed_at"
      : "company_signed_at";

  return (
    <section className="bg-soft py-10">
      <div className="container-page grid gap-6 lg:grid-cols-3">

        {/* =========================
            CONTRACT DETAILS
        ========================== */}
        <div className="card lg:col-span-2 print-contract">

          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={contract.status} />

              {contract.fully_signed && (
                <span className="status status-green">
                  Fully Signed
                </span>
              )}
            </div>

            {/* Download Agreement */}
            {contract.fully_signed && (
              <a
                href={contractPdf}
                download="AgriSure_Digital_Crop_Contract_Agreement.pdf"
                className="btn-secondary inline-flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>

                Download Agreement
              </a>
            )}
          </div>

          {/* Contract Title */}
          <div className="mt-6">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Digital Crop Contract
            </p>

            <h1 className="mt-2 font-heading text-3xl font-extrabold text-navy">
              {title}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              AgriSure digitally managed farmer-buyer agreement
            </p>
          </div>

          {/* Signed Contract Notice */}
          {contract.fully_signed && (
            <div className="mt-6 flex items-start gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>

              <div>
                <h2 className="font-heading font-bold text-emerald-900">
                  Agreement Fully Signed
                </h2>

                <p className="mt-1 text-sm text-emerald-800">
                  The digital agreement has been approved and signed by both
                  parties. Download the official agreement document using the
                  button above.
                </p>
              </div>
            </div>
          )}

          {/* Contract Information */}
          <div className="mt-8">
            <div className="mb-4">
              <h2 className="font-heading text-lg font-bold text-navy">
                Contract Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Key details of the farmer-buyer agreement.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["Crop", contract.crop_details?.name || "—"],
                ["Quantity", contract.agreed_quantity || "—"],
                [
                  "Price",
                  contract.agreed_price
                    ? formatCurrency(contract.agreed_price)
                    : "Pending",
                ],
                [
                  "Total Contract Value",
                  contract.total_amount
                    ? formatCurrency(contract.total_amount)
                    : "Pending negotiation",
                ],
                [
                  "20% Advance",
                  contract.advance_amount
                    ? formatCurrency(contract.advance_amount)
                    : "Pending negotiation",
                ],
                ["Farmer", contract.farmer_name || "—"],
                ["Buyer", contract.company_name || "—"],
                [
                  "Created",
                  contract.created_at
                    ? new Date(contract.created_at).toLocaleDateString()
                    : "—",
                ],
                [
                  "Delivery Location",
                  contract.delivery_location || "Not specified",
                ],
                [
                  "Payment Terms",
                  contract.payment_terms || "Not specified",
                ],
              ].map(([label, value]) => (
                <div
                  className="rounded-2xl border border-slate-100 bg-soft p-4"
                  key={label}
                >
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    {label}
                  </p>

                  <p className="mt-2 font-bold text-navy">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Terms */}
          <div className="mt-8 rounded-2xl border border-slate-100 bg-soft p-5">
            <h2 className="font-heading text-lg font-bold text-navy">
              Terms and Conditions
            </h2>

            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
              {contract.terms_conditions || "No terms added."}
            </p>
          </div>

          {/* Agreement Status */}
          <div className="mt-8">
            <h2 className="font-heading text-lg font-bold text-navy">
              Agreement Status
            </h2>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-white p-4">
                <p className="text-xs font-bold uppercase text-slate-400">
                  Farmer Approval
                </p>

                <p className="mt-2 font-semibold text-navy">
                  {contract.farmer_approved_at
                    ? "✓ Complete"
                    : "Pending"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-white p-4">
                <p className="text-xs font-bold uppercase text-slate-400">
                  Buyer Approval
                </p>

                <p className="mt-2 font-semibold text-navy">
                  {contract.company_approved_at
                    ? "✓ Complete"
                    : "Pending"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-white p-4">
                <p className="text-xs font-bold uppercase text-slate-400">
                  Farmer Signature
                </p>

                <p className="mt-2 font-semibold text-navy">
                  {contract.farmer_signed_at
                    ? "✓ Complete"
                    : "Pending"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-white p-4">
                <p className="text-xs font-bold uppercase text-slate-400">
                  Buyer Signature
                </p>

                <p className="mt-2 font-semibold text-navy">
                  {contract.company_signed_at
                    ? "✓ Complete"
                    : "Pending"}
                </p>
              </div>
            </div>
          </div>

          {/* Contract Actions */}
          <div className="mt-8 flex flex-wrap gap-3">

            {!contractLocked && (
              <button
                className="btn-secondary"
                disabled={
                  Boolean(actionPending) ||
                  Boolean(contract[userApprovalField])
                }
                onClick={() => action("approve")}
              >
                {actionPending === "approve"
                  ? "Approving..."
                  : "Approve Agreement"}
              </button>
            )}

            {!contractLocked && (
              <button
                className="btn-primary"
                disabled={
                  Boolean(actionPending) ||
                  Boolean(contract[userSignatureField])
                }
                onClick={() => action("sign")}
              >
                {actionPending === "sign"
                  ? "Signing..."
                  : "Sign Digital Agreement"}
              </button>
            )}

            {user?.role === "FARMER" &&
              contract.status === "ACTIVE" && (
                <button
                  className="btn-primary"
                  disabled={Boolean(actionPending)}
                  onClick={() => action("deliver")}
                >
                  {actionPending === "deliver"
                    ? "Recording Delivery..."
                    : "Mark Crop Delivered"}
                </button>
              )}

            {user?.role === "COMPANY" &&
              contract.status === "COMPLETED" && (
                <button
                  className="btn-primary"
                  disabled={Boolean(actionPending)}
                  onClick={releaseFinalPayment}
                >
                  {actionPending === "release-final"
                    ? "Releasing..."
                    : "Release Final Payment"}
                </button>
              )}
          </div>

          {/* Payment Commitment */}
          {contract.fully_signed &&
            user?.role === "COMPANY" && (
              <div className="mt-8 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                <div className="flex items-start gap-4">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                    $
                  </div>

                  <div>
                    <h2 className="font-heading text-lg font-bold text-navy">
                      Payment Commitment
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Pay the 20% advance of{" "}
                      <strong>
                        {formatCurrency(contract.advance_amount)}
                      </strong>{" "}
                      after the digital contract has been signed.
                    </p>
                  </div>
                </div>

                <button
                  className="btn-primary mt-4"
                  disabled={advancePending}
                  onClick={payAdvance}
                >
                  {advancePending
                    ? "Opening Payment..."
                    : "Open Payment Options"}
                </button>
              </div>
            )}

          {/* Message */}
          {message && (
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-sm font-semibold text-primary">
                {message}
              </p>
            </div>
          )}
        </div>

        {/* =========================
            NEGOTIATION
        ========================== */}
        {!contractLocked && (
          <div className="card h-fit">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Contract Negotiation
              </p>

              <h2 className="mt-1 font-heading text-xl font-extrabold text-navy">
                Submit an Offer
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Submit your proposed price for this contract.
              </p>
            </div>

            <form
              className="mt-5 grid gap-4"
              onSubmit={submitOffer}
            >
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Offered Price
                </label>

                <input
                  className="input"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Enter offered price"
                  value={offerPrice}
                  onChange={(event) =>
                    setOfferPrice(event.target.value)
                  }
                  required
                />
              </div>

              <button className="btn-primary">
                Submit Offer
              </button>
            </form>

            <div className="mt-8">
              <h3 className="font-heading font-bold text-navy">
                Offer History
              </h3>

              <div className="mt-4 grid gap-3">
                {offers.length === 0 && (
                  <div className="rounded-xl bg-soft p-4">
                    <p className="text-sm text-slate-500">
                      No offers have been submitted yet.
                    </p>
                  </div>
                )}

                {offers.map((item) => (
                  <div
                    className="rounded-xl border border-slate-100 bg-soft p-4"
                    key={item.id}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <b className="text-navy">
                        {formatCurrency(item.offered_price)}
                      </b>

                      <span className="text-xs font-bold uppercase text-slate-500">
                        {item.status}
                      </span>
                    </div>

                    {item.status === "PENDING" && (
                      <div className="mt-3 flex flex-wrap gap-3">
                        {item.offered_by !== user?.id && <>
                          <button className="text-sm font-bold text-primary hover:underline" onClick={() => acceptOffer(item.id)}>Accept Offer</button>
                          <button className="text-sm font-bold text-red-600 hover:underline" onClick={() => rejectOffer(item.id)}>Reject Offer</button>
                        </>}
                        {item.offered_by === user?.id && <button className="text-sm font-bold text-red-600 hover:underline" onClick={() => deleteOffer(item.id)}>Delete Offer</button>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}