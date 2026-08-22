export default function FarmerMessages() {
  return (
    <section className="section-padding">
      <div className="container-page">
        <span className="eyebrow">Messages</span>
        <h1 className="section-title">Farmer Messages</h1>

        <div className="mt-8 grid gap-4">
          <Message title="Harvest Foods Pvt Ltd" body="Please confirm next dispatch lot by Monday." />
          <Message title="AgriContract Support" body="Your document verification is in progress." />
        </div>
      </div>
    </section>
  );
}

function Message({ title, body }) {
  return (
    <article className="card">
      <h2 className="font-heading text-lg font-bold text-navy">{title}</h2>
      <p className="mt-2 text-sm text-slate-500">{body}</p>
    </article>
  );
}
