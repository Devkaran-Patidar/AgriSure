import { Link } from "react-router-dom";

export default function FarmerDashboard() {
  return (
    <section className="section-padding bg-soft">
      <div className="container-page">
        <span className="eyebrow">Farmer Dashboard</span>
        <h1 className="section-title">Welcome to your farming workspace</h1>
        <p className="section-description">
          Track contracts, crop progress, payouts, messages, and notifications in one place.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <Card title="Active Contracts" value="3 ongoing" />
          <Card title="Pending Payments" value="INR 84,000" />
          <Card title="Unread Messages" value="5 new" />
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/farmer/contracts" className="btn-primary">View Contracts</Link>
          <Link to="/farmer/profile" className="btn-secondary">Update Profile</Link>
        </div>
      </div>
    </section>
  );
}

function Card({ title, value }) {
  return (
    <div className="card">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{title}</p>
      <p className="mt-3 font-heading text-2xl font-extrabold text-navy">{value}</p>
    </div>
  );
}
