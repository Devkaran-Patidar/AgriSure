import { formatStatus, statusTone, verificationTone } from "../../lib/display";

export default function StatusBadge({ status, variant = "status" }) {
  const tone = variant === "verification" ? verificationTone(status) : statusTone(status);
  return <span className={`status status-${tone}`}>{formatStatus(status)}</span>;
}
