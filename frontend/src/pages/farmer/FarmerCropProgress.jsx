import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api";

export default function FarmerCropProgress() {
  const [crops, setCrops] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [form, setForm] = useState({ crop: "", stage: "GROWING", completion_percent: 0, notes: "", latitude: "", longitude: "", photo: null });
  const [message, setMessage] = useState("");

  const load = async () => {
    try {
      const [cropData, updateData] = await Promise.all([apiRequest("/farmer/crops/"), apiRequest("/monitoring/updates/")]);
      setCrops(cropData); setUpdates(updateData);
      if (!form.crop && cropData[0]) setForm((current) => ({ ...current, crop: cropData[0].id }));
    } catch (error) { setMessage(error.message); }
  };

  useEffect(() => { load(); }, []);

  const submit = async (event) => {
    event.preventDefault();
    const body = new FormData();
    Object.entries(form).forEach(([key, value]) => { if (value !== "" && value !== null) body.append(key, value); });
    try { await apiRequest("/monitoring/updates/", { method: "POST", body }); setMessage("Crop update submitted."); await load(); }
    catch (error) { setMessage(error.message); }
  };

  return (
    <section className="section-padding bg-soft min-h-screen">
      <div className="container-page">
        <span className="eyebrow">Phase 5 monitoring</span>
        <h1 className="section-title">Report crop progress</h1>
        {message && <p className="mt-4 rounded-xl bg-white p-4 text-sm font-bold text-primary">{message}</p>}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <form className="card grid gap-4 lg:col-span-1" onSubmit={submit}>
            <h2 className="font-heading text-xl font-extrabold text-navy">New field update</h2>
            <select className="input" value={form.crop} onChange={(event) => setForm({ ...form, crop: event.target.value })} required>
              <option value="">Select crop</option>
              {crops.map((crop) => <option key={crop.id} value={crop.id}>{crop.name} ({crop.variety})</option>)}
            </select>
            <select className="input" value={form.stage} onChange={(event) => setForm({ ...form, stage: event.target.value })}>
              <option value="PLANTED">Planted</option><option value="GROWING">Growing</option><option value="FLOWERING">Flowering</option><option value="HARVEST_READY">Harvest ready</option><option value="HARVESTED">Harvested</option>
            </select>
            <label><span className="label">Completion percentage</span><input className="input" type="number" min="0" max="100" value={form.completion_percent} onChange={(event) => setForm({ ...form, completion_percent: event.target.value })} /></label>
            <label><span className="label">Latitude</span><input className="input" type="number" step="0.000001" value={form.latitude} onChange={(event) => setForm({ ...form, latitude: event.target.value })} /></label>
            <label><span className="label">Longitude</span><input className="input" type="number" step="0.000001" value={form.longitude} onChange={(event) => setForm({ ...form, longitude: event.target.value })} /></label>
            <textarea className="input" placeholder="Field notes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
            <input className="input" type="file" accept="image/*" onChange={(event) => setForm({ ...form, photo: event.target.files[0] })} />
            <button className="btn-primary">Submit update</button>
          </form>
          <div className="grid gap-4 lg:col-span-2">
            {updates.length === 0 && <p className="text-slate-500">No progress updates submitted yet.</p>}
            {updates.map((update) => <article className="card" key={update.id}><div className="flex justify-between gap-3"><h2 className="font-heading text-xl font-bold text-navy">{update.crop_name}</h2><span className="status status-green">{update.stage}</span></div><p className="mt-2 text-sm text-slate-500">{update.completion_percent}% complete · {new Date(update.created_at).toLocaleString()}</p><p className="mt-3 text-sm text-slate-700">{update.notes || "No notes added."}</p>{update.photo_url && <a className="mt-3 inline-block text-sm font-bold text-primary" href={update.photo_url} target="_blank" rel="noreferrer">View field photo</a>}</article>)}
          </div>
        </div>
      </div>
    </section>
  );
}
