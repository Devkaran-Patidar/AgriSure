export function formatCurrency(amount) {
  if (amount == null || amount === "") return "—";
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

export function formatContractTitle(contract) {
  const crop = contract?.crop_details?.name || contract?.crop_name || "Crop";
  const farmer = contract?.farmer_name || contract?.farmer_details?.farm_name || "Farmer";
  const company = contract?.company_name || contract?.company_details?.company_name || "Buyer";
  return `${crop} · ${farmer} ↔ ${company}`;
}

export function formatPaymentTitle(account) {
  if (account?.contract_title) return account.contract_title;
  const crop = account?.crop_name || "Crop";
  const farmer = account?.farmer_name || "Farmer";
  const company = account?.company_name || "Buyer";
  return `${crop} · ${farmer} ↔ ${company}`;
}

export function formatTransactionType(type) {
  return type === "FUNDING" ? "Escrow funding" : type === "RELEASE" ? "Milestone release" : type || "Payment";
}

export function formatStatus(status) {
  return (status || "Unknown").replaceAll("_", " ");
}

export function statusTone(status = "") {
  const value = status.toUpperCase();
  if (["ACTIVE", "COMPLETED", "FUNDED", "RELEASED", "VERIFIED", "RESOLVED"].includes(value)) return "green";
  if (["PENDING", "DRAFT", "NEGOTIATING", "UNFUNDED", "PARTIALLY_RELEASED"].includes(value)) return "yellow";
  if (["CANCELLED", "REJECTED"].includes(value)) return "red";
  return "blue";
}

export function verificationTone(status = "") {
  const value = status.toUpperCase();
  if (value === "VERIFIED") return "green";
  if (value === "PENDING") return "yellow";
  if (value === "REJECTED") return "red";
  return "blue";
}
