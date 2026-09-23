import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api";

export default function FarmerCropProgress() {
  const [crops, setCrops] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [form, setForm] = useState({
    crop: "",
    stage: "GROWING",
    completion_percent: 0,
    notes: "",
    latitude: "",
    longitude: "",
    photo: null,
  });

  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      const [cropData, updateData] = await Promise.all([
        apiRequest("/farmer/crops/"),
        apiRequest("/monitoring/updates/"),
      ]);

      setCrops(cropData);
      setUpdates(updateData);

      if (!form.crop && cropData.length > 0) {
        setForm((current) => ({
          ...current,
          crop: cropData[0].id,
        }));
      }
    } catch (error) {
      setMessage(error.message || "Unable to load crop data.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handlePhoto = (event) => {
    setForm((current) => ({
      ...current,
      photo: event.target.files?.[0] || null,
    }));
  };

  const submit = async (event) => {
    event.preventDefault();

    setSubmitting(true);
    setMessage("");

    const body = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      if (value !== "" && value !== null) {
        body.append(key, value);
      }
    });

    try {
      await apiRequest("/monitoring/updates/", {
        method: "POST",
        body,
      });

      setMessage("Crop progress update submitted successfully.");

      setForm((current) => ({
        ...current,
        stage: "GROWING",
        completion_percent: 0,
        notes: "",
        latitude: "",
        longitude: "",
        photo: null,
      }));

      const fileInput = document.getElementById("crop-photo");

      if (fileInput) {
        fileInput.value = "";
      }

      await load();
    } catch (error) {
      setMessage(error.message || "Failed to submit crop update.");
    } finally {
      setSubmitting(false);
    }
  };

  const getStageLabel = (stage) => {
    const stages = {
      PLANTED: "Planted",
      GROWING: "Growing",
      FLOWERING: "Flowering",
      HARVEST_READY: "Harvest Ready",
      HARVESTED: "Harvested",
    };

    return stages[stage] || stage;
  };

  const getStageClass = (stage) => {
    switch (stage) {
      case "PLANTED":
        return "bg-blue-50 text-blue-700";

      case "GROWING":
        return "bg-emerald-50 text-emerald-700";

      case "FLOWERING":
        return "bg-purple-50 text-purple-700";

      case "HARVEST_READY":
        return "bg-amber-50 text-amber-700";

      case "HARVESTED":
        return "bg-green-100 text-green-800";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <section className="section-padding min-h-screen bg-soft">
      <div className="container-page">

        {/* Header */}
        <div className="max-w-3xl">
          <span className="eyebrow">Crop Monitoring</span>

          <h1 className="section-title mt-2">
            Track your crop progress
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600 md:text-base">
            Submit regular field updates so buyers can monitor crop development,
            production progress, and expected harvest status.
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-sm font-semibold text-primary">
              {message}
            </p>
          </div>
        )}

        <div className="mt-8 grid gap-6 xl:grid-cols-[360px_1fr]">

          {/* FORM */}
          <div className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="mb-5">
              <h2 className="font-heading text-xl font-extrabold text-navy">
                New field update
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Add the latest condition of your crop.
              </p>
            </div>

            <form className="grid gap-4" onSubmit={submit}>

              {/* Crop */}
              <div>
                <label className="label">
                  Select Crop
                </label>

                <select
                  className="input"
                  name="crop"
                  value={form.crop}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select crop</option>

                  {crops.map((crop) => (
                    <option key={crop.id} value={crop.id}>
                      {crop.name} {crop.variety ? `(${crop.variety})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stage */}
              <div>
                <label className="label">
                  Current Stage
                </label>

                <select
                  className="input"
                  name="stage"
                  value={form.stage}
                  onChange={handleChange}
                >
                  <option value="PLANTED">Planted</option>
                  <option value="GROWING">Growing</option>
                  <option value="FLOWERING">Flowering</option>
                  <option value="HARVEST_READY">Harvest Ready</option>
                  <option value="HARVESTED">Harvested</option>
                </select>
              </div>

              {/* Completion */}
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="label mb-0">
                    Completion
                  </label>

                  <span className="text-sm font-bold text-primary">
                    {form.completion_percent}%
                  </span>
                </div>

                <input
                  className="w-full accent-emerald-600"
                  type="range"
                  min="0"
                  max="100"
                  name="completion_percent"
                  value={form.completion_percent}
                  onChange={handleChange}
                />

                <div className="mt-1 flex justify-between text-xs text-slate-400">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-2 gap-3">

                <div>
                  <label className="label">
                    Latitude
                  </label>

                  <input
                    className="input"
                    type="number"
                    step="0.000001"
                    name="latitude"
                    value={form.latitude}
                    onChange={handleChange}
                    placeholder="22.7196"
                  />
                </div>

                <div>
                  <label className="label">
                    Longitude
                  </label>

                  <input
                    className="input"
                    type="number"
                    step="0.000001"
                    name="longitude"
                    value={form.longitude}
                    onChange={handleChange}
                    placeholder="75.8577"
                  />
                </div>

              </div>

              {/* Notes */}
              <div>
                <label className="label">
                  Field Notes
                </label>

                <textarea
                  className="input min-h-[100px] resize-none"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Describe crop condition, irrigation, pests, weather, etc."
                />
              </div>

              {/* Photo */}
              <div>
                <label className="label">
                  Field Photo
                </label>

                <input
                  id="crop-photo"
                  className="input cursor-pointer"
                  type="file"
                  accept="image/*"
                  onChange={handlePhoto}
                />

                {form.photo && (
                  <p className="mt-2 truncate text-xs text-slate-500">
                    Selected: {form.photo.name}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="btn-primary mt-1 w-full"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Field Update"}
              </button>

            </form>
          </div>

          {/* UPDATES */}
          <div>

            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-heading text-xl font-extrabold text-navy">
                  Progress history
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {updates.length} update
                  {updates.length !== 1 ? "s" : ""} submitted
                </p>
              </div>
            </div>

            {updates.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
                  🌱
                </div>

                <h3 className="mt-4 font-heading text-lg font-bold text-navy">
                  No progress updates yet
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                  Submit your first field update to start tracking the crop
                  lifecycle.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">

                {updates.map((update) => (
                  <article
                    key={update.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                  >

                    <div className="flex flex-col gap-4 p-4 sm:flex-row">

                      {/* SMALL IMAGE CARD */}
                      <div className="h-32 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-32 sm:w-40">

                        {update.photo_url ? (
                          <a
                            href={update.photo_url}
                            target="_blank"
                            rel="noreferrer"
                            className="block h-full w-full"
                          >
                            <img
                              src={update.photo_url}
                              alt={`${update.crop_name} field`}
                              className="h-full w-full object-cover transition duration-300 hover:scale-105"
                            />
                          </a>
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center text-slate-400">
                            <span className="text-3xl">🌱</span>
                            <span className="mt-1 text-xs">
                              No photo
                            </span>
                          </div>
                        )}

                      </div>

                      {/* CONTENT */}
                      <div className="min-w-0 flex-1">

                        {/* Top row */}
                        <div className="flex flex-wrap items-start justify-between gap-2">

                          <div>
                            <h3 className="font-heading text-lg font-extrabold text-navy">
                              {update.crop_name}
                            </h3>

                            <p className="mt-1 text-xs text-slate-500">
                              {new Date(
                                update.created_at
                              ).toLocaleString()}
                            </p>
                          </div>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${getStageClass(
                              update.stage
                            )}`}
                          >
                            {getStageLabel(update.stage)}
                          </span>

                        </div>

                        {/* Progress */}
                        <div className="mt-4">

                          <div className="mb-1 flex justify-between text-xs">
                            <span className="font-semibold text-slate-600">
                              Crop progress
                            </span>

                            <span className="font-bold text-primary">
                              {update.completion_percent}%
                            </span>
                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{
                                width: `${Math.min(
                                  Math.max(
                                    Number(update.completion_percent) || 0,
                                    0
                                  ),
                                  100
                                )}%`,
                              }}
                            />
                          </div>

                        </div>

                        {/* Notes */}
                        <p className="mt-3 line-clamp-2 text-sm leading-5 text-slate-600">
                          {update.notes || "No field notes added."}
                        </p>

                        {/* Bottom info */}
                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">

                          {(update.latitude || update.longitude) && (
                            <span>
                              📍{" "}
                              {update.latitude || "--"},{" "}
                              {update.longitude || "--"}
                            </span>
                          )}

                          {update.photo_url && (
                            <a
                              href={update.photo_url}
                              target="_blank"
                              rel="noreferrer"
                              className="font-bold text-primary hover:underline"
                            >
                              View photo
                            </a>
                          )}

                        </div>

                      </div>

                    </div>

                  </article>
                ))}

              </div>
            )}

          </div>
        </div>
      </div>
    </section>
  );
}