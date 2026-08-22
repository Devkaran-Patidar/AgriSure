export default function CompanyProfile() {
  return (
    <section className="section-padding">
      <div className="container-page max-w-4xl">
        <span className="eyebrow">Company Profile</span>
        <h1 className="section-title">Company Details</h1>

        <div className="card mt-8 grid gap-4 sm:grid-cols-2">
          <label>
            <span className="label">Company Name</span>
            <input className="input" placeholder="Harvest Foods Pvt Ltd" />
          </label>
          <label>
            <span className="label">Contact Person</span>
            <input className="input" placeholder="Ravi Mehta" />
          </label>
          <label>
            <span className="label">GST Number</span>
            <input className="input" placeholder="22AAAAA0000A1Z5" />
          </label>
          <label>
            <span className="label">Licence Number</span>
            <input className="input" placeholder="LIC-AGR-2026" />
          </label>
          <button className="btn-primary sm:col-span-2">Save Profile</button>
        </div>
      </div>
    </section>
  );
}
