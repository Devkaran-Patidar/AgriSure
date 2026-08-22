export default function ProcurementRequests() {
  return (
    <section className="section-padding">
      <div className="container-page">
        <span className="eyebrow">Procurement</span>
        <h1 className="section-title">Procurement Requests</h1>

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
              <tr>
                <td>#P-1202</td>
                <td>Wheat</td>
                <td>120 MT</td>
                <td>2026-09-15</td>
                <td><span className="status status-blue">Open</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
