import { useState, useEffect } from "react";
import { apiRequest } from "../../lib/api";

export default function FindFarmers() {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requesting, setRequesting] = useState(null); // stores crop id being requested
  const [filters, setFilters] = useState({ crop: "", state: "", district: "" });

  useEffect(() => {
    fetchCrops();
  }, []);

  const fetchCrops = async () => {
    try {
      const data = await apiRequest("/company/crops/");
      setCrops(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredCrops = crops.filter((crop) => [crop.name, crop.state, crop.district, crop.variety].some((value) => String(value || "").toLowerCase().includes(filters.crop.toLowerCase())) && (!filters.state || String(crop.state || "").toLowerCase().includes(filters.state.toLowerCase())) && (!filters.district || String(crop.district || "").toLowerCase().includes(filters.district.toLowerCase())));

  const requestContract = async (crop) => {
    setRequesting(crop.id);
    try {
      await apiRequest("/contracts/", {
        method: "POST",
        body: JSON.stringify({
          crop: crop.id,
          agreed_quantity: crop.expected_quantity, // Initial proposed quantity
        })
      });
      alert("Contract request sent successfully!");
    } catch (e) {
      alert("Failed to send request: " + e.message);
    } finally {
      setRequesting(null);
    }
  };

  return (
    <section className="section-padding bg-soft min-h-screen">
      <div className="container-page">
        <span className="eyebrow">Discovery</span>
        <h1 className="section-title">Find Available Crops</h1>

        <div className="card mt-8 grid gap-4 sm:grid-cols-4">
          <input className="input" placeholder="Search crop name" value={filters.crop} onChange={(e) => setFilters({ ...filters, crop: e.target.value })} />
          <input className="input" placeholder="State" value={filters.state} onChange={(e) => setFilters({ ...filters, state: e.target.value })} />
          <input className="input" placeholder="District" value={filters.district} onChange={(e) => setFilters({ ...filters, district: e.target.value })} />
          <button className="btn-secondary" onClick={() => setFilters({ crop: "", state: "", district: "" })}>Clear filters</button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600">
            {error}
          </div>
        )}

        <div className="table-wrap mt-6">
          <table>
            <thead>
              <tr>
                <th>Crop</th>
                <th>Variety</th>
                <th>Expected Qty</th>
                <th>Expected Price</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center py-4">Loading crops...</td></tr>
              ) : filteredCrops.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-4">No crops available.</td></tr>
              ) : (
                filteredCrops.map((crop) => (
                  <tr key={crop.id}>
                    <td className="font-bold text-navy">{crop.name}</td>
                    <td>{crop.variety}</td>
                    <td>{crop.expected_quantity}</td>
                    <td>{crop.expected_price}</td>
                    <td>
                      <button 
                        className="btn-primary py-1 px-3 text-sm"
                        disabled={requesting === crop.id}
                        onClick={() => requestContract(crop)}
                      >
                        {requesting === crop.id ? 'Sending...' : 'Request Contract'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
