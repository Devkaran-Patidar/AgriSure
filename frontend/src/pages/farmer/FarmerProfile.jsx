export default function FarmerProfile() {
  return (
    <section className="section-padding">
      <div className="container-page max-w-4xl">
        <span className="eyebrow">Profile</span>
        <h1 className="section-title">Farmer Profile</h1>
        <p className="section-description">
          Keep your farm details, crop categories, and payout account information up to date.
        </p>

        <div className="card mt-8 grid gap-4 sm:grid-cols-2">
          <label>
            <span className="label">Farm Name</span>
            <input className="input" placeholder="Green Valley Farm" />
          </label>
          <label>
            <span className="label">District</span>
            <input className="input" placeholder="Nashik" />
          </label>
          <label className="sm:col-span-2">
            <span className="label">Primary Crops</span>
            <input className="input" placeholder="Wheat, Onion, Tomato" />
          </label>
          <button className="btn-primary sm:col-span-2">Save Changes</button>
        </div>
      </div>
    </section>
  );
}
