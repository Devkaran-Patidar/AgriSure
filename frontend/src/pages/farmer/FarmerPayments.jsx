export default function FarmerPayments() {
  return (
    <section className="section-padding">
      <div className="container-page">
        <span className="eyebrow">Payments</span>
        <h1 className="section-title">Farmer Payments</h1>

        <div className="table-wrap mt-8">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Contract</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2026-08-10</td>
                <td>#F-2998</td>
                <td>INR 42,000</td>
                <td><span className="status status-green">Released</span></td>
              </tr>
              <tr>
                <td>2026-08-13</td>
                <td>#F-3021</td>
                <td>INR 84,000</td>
                <td><span className="status status-yellow">Pending Approval</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
