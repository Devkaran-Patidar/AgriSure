import { Link } from "react-router-dom";
import StatusBadge from "../common/StatusBadge";
import { formatContractTitle, formatCurrency } from "../../lib/display";

export default function ContractCard({ contract, role, signed }) {
  const title = formatContractTitle(contract);
  const partnerLabel = role === "farmer" ? "Buyer" : "Farmer";
  const partnerValue = role === "farmer"
    ? contract.company_name || contract.company_details?.company_name
    : contract.farmer_name || contract.farmer_details?.farm_name;

  return (
    <Link to={`/${role}/contracts/${contract.id}`} className="card contract-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Agreement</p>
          <h3 className="font-heading text-lg font-extrabold leading-snug text-navy">{title}</h3>
        </div>
        <StatusBadge status={signed ? "COMPLETED" : contract.status} />
      </div>
      <div className="mt-5 grid gap-3 text-sm">
        <Info label={partnerLabel} value={partnerValue} />
        <Info label="Quantity" value={contract.agreed_quantity} />
        <Info label="Price" value={contract.agreed_price ? formatCurrency(contract.agreed_price) : "Pending negotiation"} />
      </div>
      {signed && <p className="mt-5 text-sm font-bold text-primary">View signed agreement · Save PDF</p>}
    </Link>
  );
}

function Info({ label, value }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-bold text-navy">{value || "—"}</span>
    </div>
  );
}
