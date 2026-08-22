export default function FindFarmers() {
  return (
    <section className="section-padding bg-soft">
      <div className="container-page">
        <span className="eyebrow">Discovery</span>
        <h1 className="section-title">Find Farmers</h1>

        <div className="card mt-8 grid gap-4 sm:grid-cols-4">
          <input className="input" placeholder="Crop (e.g. Onion)" />
          <input className="input" placeholder="State" />
          <input className="input" placeholder="District" />
          <button className="btn-primary">Search</button>
        </div>

        <div className="table-wrap mt-6">
          <table>
            <thead>
              <tr>
                <th>Farmer</th>
                <th>Location</th>
                <th>Primary Crops</th>
                <th>Verified</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Green Valley Farm</td>
                <td>Nashik, MH</td>
                <td>Tomato, Onion</td>
                <td><span className="status status-green">Yes</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
