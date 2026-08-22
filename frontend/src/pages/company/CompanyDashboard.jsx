import { Link } from "react-router-dom";

export default function CompanyDashboard() {
  return (
    <section className="section-padding bg-soft">
      <div className="container-page">
        <span className="eyebrow">Company Dashboard</span>
        <h1 className="section-title">Procurement control center</h1>
        <p className="section-description">Monitor sourcing pipeline, contracts, negotiations, and farmer communications.</p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <Card title="Open Requests" value="12" />
          <Card title="Active Contracts" value="8" />
          <Card title="Pending Approvals" value="4" />
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/company/find-farmers" className="btn-primary">Find Farmers</Link>
          <Link to="/company/procurement" className="btn-secondary">View Requests</Link>
        </div>
      </div>
    </section>
  );
}

function Card({ title, value }) {
  return (
    <div className="card">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{title}</p>
      <p className="mt-3 font-heading text-3xl font-extrabold text-navy">{value}</p>
    </div>
  );
}
