import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api";

export default function CompanyCropMonitoring() {

  const [updates, setUpdates] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [contract, setContract] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    Promise.all([apiRequest("/monitoring/updates/"), apiRequest("/contracts/")])
      .then(([updateData, contractData]) => {
        setUpdates(updateData);
        setContracts(contractData);
        if (contractData[0]) setContract(contractData[0].id);
      })
      .catch((error) => setMessage(error.message));
  }, []);

  const requestInspection = async (event) => {
    event.preventDefault();
    try {
      await apiRequest("/monitoring/inspections/", {
        method: "POST",
        body: JSON.stringify({ contract, notes: "Inspection requested by buyer" }),
      });
      setMessage("Inspection request submitted.");
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <section className="section-padding bg-soft min-h-screen">
      <div className="container-page">
        <span className="eyebrow">Phase 5 monitoring</span>
        <h1 className="section-title">Review contracted crop progress</h1>
        {message && <p className="mt-4 rounded-xl bg-white p-4 text-sm font-bold text-primary">{message}</p>}
        <form className="card mt-8 flex flex-wrap items-end gap-4" onSubmit={requestInspection}>
          <label className="min-w-64 flex-1">
            <span className="label">Contract for inspection</span>
            <select className="input" value={contract} onChange={(event) => setContract(event.target.value)} required>
              <option value="">Select contract</option>
              {contracts.map((item) => <option key={item.id} value={item.id}>Contract #{item.id} - {item.crop_details?.name || "Crop"}</option>)}
            </select>
          </label>
          <button className="btn-primary">Request inspection</button>
        </form>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {updates.length === 0 && <p className="text-slate-500">No farmer updates are available for your contracts.</p>}
          {updates.map((update) => (
            <article className="card" key={update.id}>
              <div className="flex justify-between gap-3"><h2 className="font-heading text-xl font-bold text-navy">{update.crop_name}</h2><span className="status status-green">{update.stage}</span></div>
              <p className="mt-2 text-sm text-slate-500">{update.completion_percent}% complete - {new Date(update.created_at).toLocaleString()}</p>
              <p className="mt-3 text-sm text-slate-700">{update.notes || "No notes added."}</p>
              {update.latitude && <p className="mt-3 text-xs text-slate-500">Location: {update.latitude}, {update.longitude}</p>}
              {update.photo_url && <a className="mt-3 inline-block text-sm font-bold text-primary" href={update.photo_url} target="_blank" rel="noreferrer">View field photo</a>}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
