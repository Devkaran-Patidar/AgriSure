import { useState, useEffect } from "react";
import { apiRequest } from "../../lib/api";
import { Link } from "react-router-dom";

export default function FarmerCrops() {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", variety: "", expected_quantity: "", expected_price: "", sowing_date: "", expected_harvest_date: "", description: "" });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCrops();
  }, []);

  const fetchCrops = async () => {
    try {
      const data = await apiRequest("/farmer/crops/");
      setCrops(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const addCrop = async (event) => {
    event.preventDefault();
    try {
      await apiRequest(editingId ? `/farmer/crops/${editingId}/` : "/farmer/crops/", { method: editingId ? "PUT" : "POST", body: JSON.stringify(form) });
      setForm({ name: "", variety: "", expected_quantity: "", expected_price: "", sowing_date: "", expected_harvest_date: "", description: "" });
      setShowForm(false);
      setEditingId(null);
      setLoading(true);
      await fetchCrops();
    } catch (e) {
      setError(e.message);
    }
  };

  const editCrop = (crop) => {
    setForm({ name: crop.name, variety: crop.variety, expected_quantity: crop.expected_quantity, expected_price: crop.expected_price, sowing_date: crop.sowing_date, expected_harvest_date: crop.expected_harvest_date, description: crop.description || "" });
    setEditingId(crop.id);
    setShowForm(true);
  };

  const deleteCrop = async (id) => {
    try { await apiRequest(`/farmer/crops/${id}/`, { method: "DELETE" }); setCrops(crops.filter((crop) => crop.id !== id)); }
    catch (e) { setError(e.message); }
  };

  return (
    <section className="section-padding bg-soft min-h-screen">
      <div className="container-page">
        <span className="eyebrow">My Crops</span>
        <h1 className="section-title">Manage Your Crop Listings</h1>
        <div className="mt-5 flex flex-wrap gap-3">
          <button className="btn-primary" onClick={() => { setShowForm(!showForm); setEditingId(null); }}>{showForm ? "Close form" : "Add New Crop"}</button>
          <Link className="btn-secondary" to="/farmer/profile">View Profile</Link>
        </div>

        {showForm && <form className="card mt-6 grid gap-4 sm:grid-cols-2" onSubmit={addCrop}>
          <h2 className="font-heading text-xl font-bold text-navy sm:col-span-2">{editingId ? "Edit crop listing" : "New crop listing"}</h2>
          {[["name", "Crop name"], ["variety", "Variety"], ["expected_quantity", "Expected quantity"], ["expected_price", "Expected price"], ["sowing_date", "Sowing date"], ["expected_harvest_date", "Expected harvest date"]].map(([key, label]) => <label key={key}><span className="label">{label}</span><input className="input" type={key.includes("date") ? "date" : key.includes("quantity") || key.includes("price") ? "number" : "text"} step={key.includes("quantity") || key.includes("price") ? "0.01" : undefined} value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} required /></label>)}
          <label className="sm:col-span-2"><span className="label">Description</span><textarea className="input" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
          <button className="btn-primary sm:col-span-2">{editingId ? "Save crop" : "Publish crop"}</button>
        </form>}
        
        {error && (
          <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <p className="mt-8 font-bold text-slate-400">Loading crops...</p>
        ) : crops.length === 0 ? (
          <div className="mt-8 rounded-2xl border-2 border-dashed border-slate-300 p-10 text-center">
            <h3 className="font-heading text-xl font-bold text-navy">No crops listed yet</h3>
            <p className="mt-2 text-slate-500">Add a crop listing to start receiving contract requests from companies.</p>
            <button className="btn-primary mt-6" onClick={() => setShowForm(true)}>Add New Crop</button>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 md:grid-cols-3">
            {crops.map((crop) => (
              <div key={crop.id} className="card">
                <h3 className="font-heading text-xl font-bold text-navy">{crop.name}</h3>
                <p className="text-sm font-bold text-slate-500">{crop.variety}</p>
                <div className="mt-4 grid gap-2 text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span>Expected Qty:</span>
                    <span className="font-bold text-navy">{crop.expected_quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expected Price:</span>
                    <span className="font-bold text-navy">{crop.expected_price}</span>
                  </div>
                </div>
                <div className="mt-5 flex gap-3"><button className="btn-secondary py-2 text-sm" onClick={() => editCrop(crop)}>Edit</button><button className="btn-secondary py-2 text-sm text-red-600" onClick={() => deleteCrop(crop.id)}>Delete</button></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
