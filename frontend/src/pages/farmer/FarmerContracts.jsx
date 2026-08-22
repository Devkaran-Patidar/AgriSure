import { Link } from "react-router-dom";

export default function FarmerContracts() {
  return (
    <section className="section-padding bg-soft">
      <div className="container-page">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="eyebrow">Contracts</span>
            <h1 className="section-title">Farmer Contracts</h1>
          </div>
          <Link to="/farmer/contracts/new" className="btn-primary">Create Contract</Link>
        </div>

        <div className="table-wrap mt-8">
          <table>
            <thead>
              <tr>
                <th>Contract ID</th>
                <th>Buyer</th>
                <th>Crop</th>
                <th>Quantity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>#F-3021</td>
                <td>Harvest Foods Pvt Ltd</td>
                <td>Tomato</td>
                <td>40 MT</td>
                <td><span className="status status-blue">In Review</span></td>
              </tr>
              <tr>
                <td>#F-2998</td>
                <td>Agri Bulk Buyers</td>
                <td>Onion</td>
                <td>60 MT</td>
                <td><span className="status status-green">Active</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
