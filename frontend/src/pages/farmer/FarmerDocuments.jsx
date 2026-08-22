export default function FarmerDocuments() {
  return (
    <section className="section-padding bg-soft">
      <div className="container-page max-w-4xl">
        <span className="eyebrow">Documents</span>
        <h1 className="section-title">Farmer Documents</h1>

        <div className="card mt-8 grid gap-4">
          <p className="text-sm text-slate-600">Upload and track verification documents and contract attachments.</p>
          <label>
            <span className="label">Upload File</span>
            <input type="file" className="input" />
          </label>
          <button className="btn-primary">Upload Document</button>
        </div>
      </div>
    </section>
  );
}
