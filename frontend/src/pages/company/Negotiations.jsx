export default function Negotiations() {
  return (
    <section className="section-padding bg-soft">
      <div className="container-page">
        <span className="eyebrow">Negotiations</span>
        <h1 className="section-title">Negotiation Workspace</h1>

        <div className="mt-8 grid gap-4">
          <div className="card">
            <h2 className="font-heading text-lg font-bold text-navy">Contract #C-4402</h2>
            <p className="mt-2 text-sm text-slate-500">Buyer offer: INR 2,250 per quintal</p>
            <p className="mt-1 text-sm text-slate-500">Farmer counter: INR 2,380 per quintal</p>
            <span className="status status-yellow mt-4">Awaiting response</span>
          </div>
        </div>
      </div>
    </section>
  );
}
