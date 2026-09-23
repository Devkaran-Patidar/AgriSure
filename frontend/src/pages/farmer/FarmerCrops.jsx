import { useState, useEffect } from "react";
import { apiRequest } from "../../lib/api";
import { Link } from "react-router-dom";

const initialForm = {
  name: "",
  variety: "",
  cultivation_area: "",
  expected_quantity: "",
  minimum_contract_quantity: "",
  expected_price: "",
  farming_method: "Conventional",
  quality_grade: "Grade A",
  irrigation_type: "Borewell",
  sowing_date: "",
  expected_harvest_date: "",
  delivery_location: "",
  description: "",
};

export default function FarmerCrops() {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [lockedCropIds, setLockedCropIds] = useState([]);

  useEffect(() => {
    fetchCrops();
    apiRequest("/contracts/")
      .then((contracts) => setLockedCropIds(contracts.filter((contract) => contract.status !== "CANCELLED").map((contract) => contract.crop)))
      .catch(() => {});
  }, []);

  const fetchCrops = async () => {
    try {
      setError("");
      const data = await apiRequest("/farmer/crops/");
      setCrops(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addCrop = async (event) => {
    event.preventDefault();

    try {
      setError("");

      const payload = {
        ...form,
        cultivation_area: Number(form.cultivation_area),
        expected_quantity: Number(form.expected_quantity),
        minimum_contract_quantity: Number(
          form.minimum_contract_quantity
        ),
        expected_price: Number(form.expected_price),
      };

      await apiRequest(
        editingId
          ? `/farmer/crops/${editingId}/`
          : "/farmer/crops/",
        {
          method: editingId ? "PUT" : "POST",
          body: JSON.stringify(payload),
        }
      );

      resetForm();
      setShowForm(false);
      setLoading(true);

      await fetchCrops();
    } catch (e) {
      setError(e.message);
    }
  };

  const editCrop = (crop) => {
    setForm({
      name: crop.name || "",
      variety: crop.variety || "",
      cultivation_area: crop.cultivation_area || "",
      expected_quantity: crop.expected_quantity || "",
      minimum_contract_quantity:
        crop.minimum_contract_quantity || "",
      expected_price: crop.expected_price || "",
      farming_method: crop.farming_method || "Conventional",
      quality_grade: crop.quality_grade || "Grade A",
      irrigation_type: crop.irrigation_type || "Borewell",
      sowing_date: crop.sowing_date || "",
      expected_harvest_date: crop.expected_harvest_date || "",
      delivery_location: crop.delivery_location || "",
      description: crop.description || "",
    });

    setEditingId(crop.id);
    setShowForm(true);
    setError("");
  };

  const deleteCrop = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this crop listing?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await apiRequest(`/farmer/crops/${id}/`, {
        method: "DELETE",
      });

      setCrops((prev) =>
        prev.filter((crop) => crop.id !== id)
      );
    } catch (e) {
      setError(e.message);
    }
  };

  const openNewCropForm = () => {
    resetForm();
    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    resetForm();
    setError("");
    setShowForm(false);
  };

  return (
    <section className="section-padding bg-soft min-h-screen">
      <div className="container-page">

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>

            <h5 className="section-title text-sm font-bold text-navy">
              My Crops
            </h5>

            <p className="mt-2 max-w-2xl text-slate-500">
              Add crops that you plan to cultivate and make
              available for contract farming opportunities.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="btn-primary"
              onClick={showForm ? closeForm : openNewCropForm}
            >
              {showForm ? "Close Form" : "Add Crop for Contract"}
            </button>

            <Link
              className="btn-secondary"
              to="/farmer/profile"
            >
              View Profile
            </Link>
          </div>
        </div>

        {/* Information */}
        <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <h3 className="font-heading font-bold text-navy">
            How crop contracting works
          </h3>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            Add your planned crop and production details.
            Companies can review your crop and send contract
            offers. Price, quantity, delivery and payment terms
            are finalized during contract negotiation.
          </p>
        </div>

        {/* Form */}
        {showForm && (
          <form
            className="card mt-6"
            onSubmit={addCrop}
          >
            <div className="mb-6">
              <h2 className="font-heading text-xl font-bold text-navy">
                {editingId
                  ? "Edit Crop Details"
                  : "Add Crop for Contract Farming"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Provide accurate information so buyers can
                evaluate your crop for a potential contract.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">

              {/* Crop Name */}
              <label>
                <span className="label">
                  Crop Name *
                </span>

                <input
                  className="input"
                  type="text"
                  name="name"
                  placeholder="e.g. Wheat"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </label>

              {/* Variety */}
              <label>
                <span className="label">
                  Variety *
                </span>

                <input
                  className="input"
                  type="text"
                  name="variety"
                  placeholder="e.g. Sharbati"
                  value={form.variety}
                  onChange={handleChange}
                  required
                />
              </label>

              {/* Cultivation Area */}
              <label>
                <span className="label">
                  Cultivation Area (acres) *
                </span>

                <input
                  className="input"
                  type="number"
                  name="cultivation_area"
                  placeholder="e.g. 5"
                  min="0.01"
                  step="0.01"
                  value={form.cultivation_area}
                  onChange={handleChange}
                  required
                />
              </label>

              {/* Expected Quantity */}
              <label>
                <span className="label">
                  Expected Production (quintals) *
                </span>

                <input
                  className="input"
                  type="number"
                  name="expected_quantity"
                  placeholder="e.g. 100"
                  min="0.01"
                  step="0.01"
                  value={form.expected_quantity}
                  onChange={handleChange}
                  required
                />
              </label>

              {/* Minimum Contract Quantity */}
              <label>
                <span className="label">
                  Minimum Contract Quantity (quintals) *
                </span>

                <input
                  className="input"
                  type="number"
                  name="minimum_contract_quantity"
                  placeholder="e.g. 50"
                  min="0.01"
                  step="0.01"
                  value={form.minimum_contract_quantity}
                  onChange={handleChange}
                  required
                />

                <span className="mt-1 block text-xs text-slate-400">
                  Minimum quantity you are willing to commit.
                </span>
              </label>

              {/* Expected Price */}
              <label>
                <span className="label">
                  Expected Price (₹ / quintal) *
                </span>

                <input
                  className="input"
                  type="number"
                  name="expected_price"
                  placeholder="e.g. 2800"
                  min="0"
                  step="0.01"
                  value={form.expected_price}
                  onChange={handleChange}
                  required
                />

                <span className="mt-1 block text-xs text-slate-400">
                  This is your expected price. Final price is
                  decided during negotiation.
                </span>
              </label>

              {/* Farming Method */}
              <label>
                <span className="label">
                  Farming Method *
                </span>

                <select
                  className="input"
                  name="farming_method"
                  value={form.farming_method}
                  onChange={handleChange}
                  required
                >
                  <option value="Conventional">
                    Conventional
                  </option>

                  <option value="Organic">
                    Organic
                  </option>

                  <option value="Natural">
                    Natural Farming
                  </option>

                  <option value="Integrated">
                    Integrated Farming
                  </option>
                </select>
              </label>

              {/* Quality */}
              <label>
                <span className="label">
                  Expected Quality / Grade *
                </span>

                <select
                  className="input"
                  name="quality_grade"
                  value={form.quality_grade}
                  onChange={handleChange}
                  required
                >
                  <option value="Grade A">
                    Grade A
                  </option>

                  <option value="Grade B">
                    Grade B
                  </option>

                  <option value="Grade C">
                    Grade C
                  </option>

                  <option value="Premium">
                    Premium
                  </option>
                </select>
              </label>

              {/* Irrigation */}
              <label>
                <span className="label">
                  Irrigation Type *
                </span>

                <select
                  className="input"
                  name="irrigation_type"
                  value={form.irrigation_type}
                  onChange={handleChange}
                  required
                >
                  <option value="Borewell">
                    Borewell
                  </option>

                  <option value="Canal">
                    Canal
                  </option>

                  <option value="Rain-fed">
                    Rain-fed
                  </option>

                  <option value="Drip">
                    Drip Irrigation
                  </option>

                  <option value="Sprinkler">
                    Sprinkler
                  </option>
                </select>
              </label>

              {/* Sowing Date */}
              <label>
                <span className="label">
                  Sowing Date *
                </span>

                <input
                  className="input"
                  type="date"
                  name="sowing_date"
                  value={form.sowing_date}
                  onChange={handleChange}
                  required
                />
              </label>

              {/* Harvest Date */}
              <label>
                <span className="label">
                  Expected Harvest Date *
                </span>

                <input
                  className="input"
                  type="date"
                  name="expected_harvest_date"
                  value={form.expected_harvest_date}
                  onChange={handleChange}
                  required
                />
              </label>

              {/* Delivery Location */}
              <label>
                <span className="label">
                  Preferred Delivery Location *
                </span>

                <input
                  className="input"
                  type="text"
                  name="delivery_location"
                  placeholder="e.g. Indore Collection Center"
                  value={form.delivery_location}
                  onChange={handleChange}
                  required
                />
              </label>

              {/* Description */}
              <label className="sm:col-span-2">
                <span className="label">
                  Additional Information
                </span>

                <textarea
                  className="input min-h-[110px]"
                  name="description"
                  placeholder="Mention any important information about your crop, quality, cultivation or contract requirements..."
                  value={form.description}
                  onChange={handleChange}
                />
              </label>

            </div>

            {/* Form Actions */}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                className="btn-primary"
              >
                {editingId
                  ? "Save Crop Details"
                  : "Publish for Contract"}
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={closeForm}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <p className="mt-8 font-bold text-slate-400">
            Loading crops...
          </p>
        ) : crops.length === 0 ? (

          /* Empty State */
          <div className="mt-8 rounded-2xl border-2 border-dashed border-slate-300 p-10 text-center">

            <h3 className="font-heading text-xl font-bold text-navy">
              No crops available for contract
            </h3>

            <p className="mx-auto mt-2 max-w-lg text-slate-500">
              Add a crop you plan to cultivate to allow
              verified companies to send contract offers.
            </p>

            <button
              className="btn-primary mt-6"
              onClick={openNewCropForm}
            >
              Add Crop for Contract
            </button>
          </div>

        ) : (

          /* Crop Cards */
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {crops.map((crop) => {
              const isLocked = lockedCropIds.includes(crop.id);
              return (
              <div
                key={crop.id}
                className="card transition hover:-translate-y-1"
              >

                {/* Header */}
                <div className="flex items-start justify-between gap-3">

                  <div>
                    <h3 className="font-heading text-xl font-bold text-navy">
                      {crop.name}
                    </h3>

                    <p className="text-sm font-bold text-slate-500">
                      {crop.variety}
                    </p>
                  </div>

                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${isLocked ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"}`}>
                    {isLocked ? "Contract in progress" : "Contract Ready"}
                  </span>
                </div>

                {/* Details */}
                <div className="mt-5 grid gap-3 text-sm">

                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500">
                      Cultivation Area
                    </span>

                    <span className="font-bold text-navy">
                      {crop.cultivation_area} acres
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500">
                      Expected Quantity
                    </span>

                    <span className="font-bold text-navy">
                      {crop.expected_quantity} qtl
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500">
                      Minimum Contract
                    </span>

                    <span className="font-bold text-navy">
                      {crop.minimum_contract_quantity} qtl
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500">
                      Expected Price
                    </span>

                    <span className="font-bold text-navy">
                      ₹{crop.expected_price}/qtl
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500">
                      Quality
                    </span>

                    <span className="font-bold text-navy">
                      {crop.quality_grade}
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500">
                      Farming
                    </span>

                    <span className="font-bold text-navy">
                      {crop.farming_method}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      Harvest
                    </span>

                    <span className="font-bold text-navy">
                      {crop.expected_harvest_date}
                    </span>
                  </div>

                </div>

                {/* Delivery */}
                <div className="mt-4 rounded-xl bg-slate-50 p-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Delivery Location
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {crop.delivery_location || "Not specified"}
                  </p>
                </div>

                {/* created at */}
                <div className="mt-4 rounded-xl bg-slate-50 p-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    {/* Created At */}
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {function getCreatedOrUpdatedDate() {
                      if (crop.updated_at) {
                        return `Updated: ${crop.updated_at[0]} ${crop.updated_at[1]} ${crop.updated_at[2]} ${crop.updated_at[3]} ${crop.updated_at[4]} ${crop.updated_at[5]} ${crop.updated_at[6]} ${crop.updated_at[7]} ${crop.updated_at[8]} ${crop.updated_at[9]}`;
                      } else {
                        return `Created: ${crop.created_at[0]} ${crop.created_at[1]} ${crop.created_at[2]} ${crop.created_at[3]} ${crop.created_at[4]} ${crop.created_at[5]} ${crop.created_at[6]} ${crop.created_at[7]} ${crop.created_at[8]} ${crop.created_at[9]}`;
                      }
                    }()}
                  </p>
                </div>

                {/* Actions */}
                <div className="mt-5 flex gap-3">

                  <button
                    className="btn-secondary flex-1 py-2 text-sm"
                    disabled={isLocked}
                    onClick={() => editCrop(crop)}
                  >
                    {isLocked ? "Locked" : "Edit"}
                  </button>

                  <button
                    className="btn-secondary flex-1 py-2 text-sm text-red-600"
                    disabled={isLocked}
                    onClick={() => deleteCrop(crop.id)}
                  >
                    Delete
                  </button>

                </div>

              </div>
              );
            })}

          </div>
        )}

      </div>
    </section>
  );
}