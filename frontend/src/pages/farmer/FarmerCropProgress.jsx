export default function FarmerCropProgress() {
  return (
    <section className="section-padding bg-soft">
      <div className="container-page">
        <span className="eyebrow">Crop Monitoring</span>
        <h1 className="section-title">Farmer Crop Progress</h1>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <Stage crop="Tomato" stage="Flowering" completion="72%" />
          <Stage crop="Onion" stage="Bulb Formation" completion="55%" />
        </div>
      </div>
    </section>
  );
}

function Stage({ crop, stage, completion }) {
  return (
    <div className="card">
      <h2 className="font-heading text-xl font-bold text-navy">{crop}</h2>
      <p className="mt-2 text-sm text-slate-500">Current stage: {stage}</p>
      <div className="mt-5 h-2 rounded-full bg-slate-200">
        <div className="h-2 rounded-full bg-primary" style={{ width: completion }} />
      </div>
      <p className="mt-2 text-xs font-bold text-primary">{completion} complete</p>
    </div>
  );
}
