import { useState, useEffect } from "react";
import { apiRequest } from "../../lib/api";

export default function FindFarmers() {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [requesting, setRequesting] = useState(null);
  const [requestStatus, setRequestStatus] = useState({});
  const [selectedCrop, setSelectedCrop] = useState(null);

  const [filters, setFilters] = useState({
    crop: "",
    state: "",
    district: "",
  });

  useEffect(() => {
    fetchCrops();
  }, []);

  /* =========================
     FETCH CROPS
  ========================= */

  const fetchCrops = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest("/company/crops/");

      setCrops(Array.isArray(data) ? data : []);

      /*
        If backend already sends request_status,
        initialize the frontend status from it.
      */
      const statuses = {};

      if (Array.isArray(data)) {
        data.forEach((crop) => {
          if (crop.request_status) {
            statuses[crop.id] = normalizeRequestStatus(crop.request_status);
          }
        });
      }

      setRequestStatus(statuses);
    } catch (e) {
      setError(e.message || "Failed to load crops.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     FILTER CROPS
  ========================= */

  const filteredCrops = crops.filter((crop) => {
    const cropSearch = filters.crop.toLowerCase().trim();

    const matchesCrop =
      !cropSearch ||
      String(crop.name || "")
        .toLowerCase()
        .includes(cropSearch) ||
      String(crop.variety || "")
        .toLowerCase()
        .includes(cropSearch);

    const matchesState =
      !filters.state ||
      String(crop.state || "")
        .toLowerCase()
        .includes(filters.state.toLowerCase().trim());

    const matchesDistrict =
      !filters.district ||
      String(crop.district || "")
        .toLowerCase()
        .includes(filters.district.toLowerCase().trim());

    return (
      matchesCrop &&
      matchesState &&
      matchesDistrict
    );
  });

  /* =========================
     CLEAR FILTERS
  ========================= */

  const clearFilters = () => {
    setFilters({
      crop: "",
      state: "",
      district: "",
    });
  };

  /* =========================
     FORMAT DATE
  ========================= */

  const formatDate = (date) => {
    if (!date) {
      return "Not specified";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /* =========================
     REQUEST CONTRACT
  ========================= */

  const requestContract = async (crop) => {
    if (!crop?.id) {
      return;
    }

    /*
      Prevent duplicate request if already pending.
    */
      if (isRequestActive(requestStatus[crop.id])) {
      return;
    }

    setRequesting(crop.id);

    try {
      await apiRequest("/contracts/", {
        method: "POST",
        body: JSON.stringify({
          crop: crop.id,

          /*
            Initial proposed quantity.
            Final quantity should be decided
            during negotiation.
          */
          agreed_quantity: crop.expected_quantity,
        }),
      });

      /*
        Update button immediately.
      */
      setRequestStatus((previous) => ({
        ...previous,
        [crop.id]: "pending",
      }));

      alert("Contract request sent successfully!");

      /*
        Close details modal after successful request.
      */
      setSelectedCrop(null);
    } catch (e) {
      alert(
        "Failed to send request: " +
          (e.message || "Something went wrong.")
      );
    } finally {
      setRequesting(null);
    }
  };

  return (
    <section className="section-padding bg-soft min-h-screen">
      <div className="container-page">

        {/* =========================
            PAGE HEADER
        ========================= */}

        <div>
          <span className="eyebrow">
            Discovery
          </span>

          <h1 className="section-title">
            Find Available Crops
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Explore crops available for contract farming,
            review farmer production details, and send
            contract requests.
          </p>
        </div>

        {/* =========================
            FILTER SECTION
        ========================= */}

        <div className="card mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <input
            type="text"
            className="input"
            placeholder="Search crop or variety"
            value={filters.crop}
            onChange={(e) =>
              setFilters({
                ...filters,
                crop: e.target.value,
              })
            }
          />

          <input
            type="text"
            className="input"
            placeholder="State"
            value={filters.state}
            onChange={(e) =>
              setFilters({
                ...filters,
                state: e.target.value,
              })
            }
          />

          <input
            type="text"
            className="input"
            placeholder="District"
            value={filters.district}
            onChange={(e) =>
              setFilters({
                ...filters,
                district: e.target.value,
              })
            }
          />

          <button
            type="button"
            className="btn-secondary"
            onClick={clearFilters}
          >
            Clear Filters
          </button>

        </div>

        {/* =========================
            ERROR
        ========================= */}

        {error && (
          <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600">
            {error}
          </div>
        )}

        {/* =========================
            RESULT COUNT
        ========================= */}

        {!loading && !error && (
          <div className="mt-6">
            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-bold text-navy">
                {filteredCrops.length}
              </span>{" "}
              available crop
              {filteredCrops.length !== 1
                ? "s"
                : ""}
            </p>
          </div>
        )}

        {/* =========================
            LOADING CARDS
        ========================= */}

        {loading && (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="card animate-pulse"
              >
                <div className="h-5 w-32 rounded bg-slate-200" />

                <div className="mt-3 h-4 w-48 rounded bg-slate-200" />

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="h-16 rounded bg-slate-200" />
                  <div className="h-16 rounded bg-slate-200" />
                </div>

                <div className="mt-4 h-10 rounded bg-slate-200" />
              </div>
            ))}

          </div>
        )}

        {/* =========================
            EMPTY STATE
        ========================= */}

        {!loading &&
          filteredCrops.length === 0 && (
            <div className="card mt-8 py-14 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
                🌾
              </div>

              <h3 className="mt-4 text-lg font-bold text-navy">
                No crops available
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Try changing your search or clearing
                the filters.
              </p>

            </div>
          )}

        {/* =========================
            CROP CARDS
        ========================= */}

        {!loading &&
          filteredCrops.length > 0 && (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

              {filteredCrops.map((crop) => {
                const requestState = requestStatus[crop.id];
                const isPending = isRequestActive(requestState);

                return (
                  <div
                    key={crop.id}
                    className="card group cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                    onClick={() =>
                      setSelectedCrop(crop)
                    }
                  >

                    {/* CARD HEADER */}

                    <div className="flex items-start justify-between gap-3">

                      <div>
                        <h2 className="text-lg font-bold text-navy">
                          {crop.name}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          {crop.variety ||
                            "Variety not specified"}
                        </p>
                      </div>

                      {isPending ? (
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                          {requestState === "negotiating"
                            ? "Negotiation open"
                            : requestState === "agreed" || requestState === "active"
                            ? "Contract in progress"
                            : "Request Pending"}
                        </span>
                      ) : (
                        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                          Available
                        </span>
                      )}

                    </div>

                    {/* MAIN INFORMATION */}

                    <div className="mt-5 grid grid-cols-2 gap-3">

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">
                          Expected Quantity
                        </p>

                        <p className="mt-1 font-bold text-navy">
                          {crop.expected_quantity ||
                            "-"}{" "}
                          Qtl
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">
                          Expected Price
                        </p>

                        <p className="mt-1 font-bold text-navy">
                          ₹
                          {crop.expected_price ||
                            "-"}
                        </p>

                        <p className="text-[10px] text-slate-400">
                          per quintal
                        </p>
                      </div>

                    </div>

                    {/* SECONDARY INFORMATION */}

                    <div className="mt-4 space-y-2 text-sm">

                      <div className="flex justify-between gap-3">
                        <span className="text-slate-500">
                          Quality
                        </span>

                        <span className="font-semibold text-navy">
                          {crop.quality_grade ||
                            "Not specified"}
                        </span>
                      </div>

                      <div className="flex justify-between gap-3">
                        <span className="text-slate-500">
                          Harvest
                        </span>

                        <span className="font-semibold text-navy">
                          {formatDate(
                            crop.expected_harvest_date
                          )}
                        </span>
                      </div>

                      <div className="flex justify-between gap-3">
                        <span className="text-slate-500">
                          Location
                        </span>

                        <span className="max-w-[55%] truncate text-right font-semibold text-navy">
                          {crop.district ||
                            crop.state ||
                            crop.delivery_location ||
                            "Not specified"}
                        </span>
                      </div>

                    </div>

                    {/* VIEW DETAILS */}

                    <div className="mt-5 border-t border-slate-100 pt-4">

                      <button
                        type="button"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-navy transition hover:bg-slate-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCrop(crop);
                        }}
                      >
                        View Full Details →
                      </button>

                    </div>

                  </div>
                );
              })}

            </div>
          )}

      </div>

      {/* ==================================================
          CROP DETAILS MODAL
      ================================================== */}

      {selectedCrop && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setSelectedCrop(null)}
        >

          <div
            className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* =========================
                MODAL HEADER
            ========================= */}

            <div className="sticky top-0 z-10 border-b border-slate-100 bg-white px-6 py-5">

              <div className="flex items-start justify-between gap-4">

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                    Contract Farming Opportunity
                  </span>

                  <h2 className="mt-1 text-2xl font-bold text-navy">
                    {selectedCrop.name}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {selectedCrop.variety ||
                      "Variety not specified"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedCrop(null)
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-600 transition hover:bg-slate-200"
                >
                  ×
                </button>

              </div>

            </div>

            {/* =========================
                MODAL CONTENT
            ========================= */}

            <div className="space-y-6 p-6">

              {/* CROP OVERVIEW */}

              <div>
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
                  Crop Overview
                </h3>

                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

                  <DetailItem
                    label="Crop"
                    value={selectedCrop.name}
                  />

                  <DetailItem
                    label="Variety"
                    value={selectedCrop.variety}
                  />

                  <DetailItem
                    label="Cultivation Area"
                    value={
                      selectedCrop.cultivation_area
                        ? `${selectedCrop.cultivation_area} acres`
                        : "Not specified"
                    }
                  />

                  <DetailItem
                    label="Expected Quantity"
                    value={
                      selectedCrop.expected_quantity
                        ? `${selectedCrop.expected_quantity} quintals`
                        : "Not specified"
                    }
                  />

                  <DetailItem
                    label="Minimum Contract Quantity"
                    value={
                      selectedCrop.minimum_contract_quantity
                        ? `${selectedCrop.minimum_contract_quantity} quintals`
                        : "Not specified"
                    }
                  />

                  <DetailItem
                    label="Expected Price"
                    value={
                      selectedCrop.expected_price
                        ? `₹${selectedCrop.expected_price} / quintal`
                        : "Not specified"
                    }
                  />

                </div>
              </div>

              {/* FARMING DETAILS */}

              <div>
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
                  Farming Details
                </h3>

                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

                  <DetailItem
                    label="Farming Method"
                    value={
                      selectedCrop.farming_method
                    }
                  />

                  <DetailItem
                    label="Quality Grade"
                    value={
                      selectedCrop.quality_grade
                    }
                  />

                  <DetailItem
                    label="Irrigation Type"
                    value={
                      selectedCrop.irrigation_type
                    }
                  />

                  <DetailItem
                    label="Sowing Date"
                    value={formatDate(
                      selectedCrop.sowing_date
                    )}
                  />

                  <DetailItem
                    label="Expected Harvest"
                    value={formatDate(
                      selectedCrop.expected_harvest_date
                    )}
                  />

                  <DetailItem
                    label="Delivery Location"
                    value={
                      selectedCrop.delivery_location
                    }
                  />

                </div>
              </div>

              {/* LOCATION */}

              {(selectedCrop.state ||
                selectedCrop.district) && (
                <div>

                  <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
                    Farm Location
                  </h3>

                  <div className="mt-3 rounded-xl bg-slate-50 p-4">

                    <p className="font-semibold text-navy">
                      {[
                        selectedCrop.district,
                        selectedCrop.state,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>

                  </div>

                </div>
              )}

              {/* DESCRIPTION */}

              <div>

                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
                  Farmer Description
                </h3>

                <div className="mt-3 rounded-xl bg-slate-50 p-4">

                  <p className="whitespace-pre-line text-sm leading-6 text-slate-600">
                    {selectedCrop.description ||
                      "No additional description provided by the farmer."}
                  </p>

                </div>

              </div>

              {/* CONTRACT INFORMATION */}

              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">

                <h3 className="font-bold text-navy">
                  Contract Information
                </h3>

                <div className="mt-3 space-y-2 text-sm text-slate-600">

                  <p>
                    • The displayed price is the
                    farmer's expected starting price.
                  </p>

                  <p>
                    • Final quantity and price can be
                    negotiated between the company and
                    farmer.
                  </p>

                  <p>
                    • Payment structure is 20% advance
                    and 80% after the agreed crop
                    delivery/release.
                  </p>

                </div>

              </div>

            </div>

            {/* =========================
                MODAL FOOTER
            ========================= */}

            <div className="sticky bottom-0 border-t border-slate-100 bg-white px-6 py-4">

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() =>
                    setSelectedCrop(null)
                  }
                >
                  Close
                </button>

                <button
                  type="button"
                  className="btn-primary"
                  disabled={
                    requesting ===
                      selectedCrop.id ||
                    isRequestActive(requestStatus[selectedCrop.id])
                  }
                  onClick={() =>
                    requestContract(selectedCrop)
                  }
                >
                  {requesting === selectedCrop.id
                    ? "Sending..."
                    : isRequestActive(requestStatus[selectedCrop.id])
                    ? requestStatus[selectedCrop.id] === "negotiating"
                      ? "Negotiation Started"
                      : "Request Pending"
                    : "Request Contract"}
                </button>

              </div>

            </div>

          </div>

        </div>
      )}
    </section>
  );
}

function normalizeRequestStatus(status) {
  return String(status || "").toLowerCase() === "draft"
    ? "pending"
    : String(status || "").toLowerCase();
}

function isRequestActive(status) {
  return ["pending", "draft", "negotiating", "agreed", "active"].includes(
    String(status || "").toLowerCase()
  );
}

/* ==================================================
   DETAIL ITEM COMPONENT
================================================== */

function DetailItem({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">

      <p className="text-xs font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-navy">
        {value || "Not specified"}
      </p>

    </div>
  );
}
