export default function FarmerEarnings() {
  return (
    <section className="section-padding">
      <div className="container-page">
        <span className="eyebrow">Earnings</span>
        <h1 className="section-title">Farmer Earnings</h1>
        <p className="section-description">Summary of settled and pending payouts linked to active contracts.</p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <Summary label="Total Earned" value="INR 4,92,000" />
          <Summary label="Pending" value="INR 84,000" />
          <Summary label="This Month" value="INR 1,26,000" />
        </div>
      </div>
    </section>
  );
}

function Summary({ label, value }) {
  return (
    <div className="card">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-3 font-heading text-3xl font-extrabold text-navy">{value}</p>
    </div>
  );
}
