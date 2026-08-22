export default function FarmerNotifications() {
  return (
    <section className="section-padding bg-soft">
      <div className="container-page">
        <span className="eyebrow">Notifications</span>
        <h1 className="section-title">Farmer Notifications</h1>

        <div className="mt-8 grid gap-4">
          <Notice text="Contract #F-3021 moved to review stage." level="status-blue" />
          <Notice text="Payment milestone approved for contract #F-2998." level="status-green" />
          <Notice text="Document update required: Land ownership proof." level="status-yellow" />
        </div>
      </div>
    </section>
  );
}

function Notice({ text, level }) {
  return (
    <div className="card flex items-center justify-between gap-4">
      <p className="text-sm text-slate-600">{text}</p>
      <span className={`status ${level}`}>Update</span>
    </div>
  );
}
