import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api";

export default function ProcurementRequests() {
  const [contracts, setContracts] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => { apiRequest("/contracts/").then(setContracts).catch((e) => setError(e.message)); }, []);

  return (
    <section className="section-padding">
      <div className="container-page">
        <span className="eyebrow">Procurement</span>
        <h1 className="section-title">Procurement Requests</h1>

        {error && <p className="mt-6 text-sm font-bold text-red-600">{error}</p>}
        <div className="table-wrap mt-8">
          <table>
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Crop</th>
                <th>Quantity</th>
                <th>Target Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {contracts.length === 0 ? <tr><td colSpan="5" className="text-center">No procurement requests yet.</td></tr> : contracts.map((contract) => <tr key={contract.id}><td><Link className="font-bold text-primary" to={`/company/contracts/${contract.id}`}>#{contract.id}</Link></td><td>{contract.crop_details?.name || "Crop"}</td><td>{contract.agreed_quantity}</td><td>{contract.created_at ? new Date(contract.created_at).toLocaleDateString() : "-"}</td><td><span className={`status ${contract.status === "ACTIVE" ? "status-green" : contract.status === "CANCELLED" ? "status-red" : "status-blue"}`}>{contract.status}</span></td></tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
