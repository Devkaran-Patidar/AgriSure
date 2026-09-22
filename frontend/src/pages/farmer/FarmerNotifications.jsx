import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api";

export default function FarmerNotifications() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const load = () => apiRequest("/communications/notifications/").then(setItems).catch((e) => setError(e.message));
  useEffect(load, []);
  const markRead = async (id) => { try { await apiRequest(`/communications/notifications/${id}/read/`, { method: "PATCH", body: JSON.stringify({ is_read: true }) }); await load(); } catch (e) { setError(e.message); } };
  return <section className="section-padding bg-soft min-h-screen"><div className="container-page"><span className="eyebrow">Communications</span><h1 className="section-title">Notifications</h1>{error && <p className="mt-4 text-sm font-bold text-red-600">{error}</p>}<div className="mt-8 grid gap-4">{items.length === 0 && !error && <p className="text-slate-500">No notifications yet.</p>}{items.map((item) => <article className={`card flex items-center justify-between gap-4 ${item.is_read ? "opacity-60" : ""}`} key={item.id}><div><h2 className="font-heading text-lg font-bold text-navy">{item.title}</h2><p className="mt-1 text-sm text-slate-600">{item.message}</p></div>{!item.is_read && <button className="btn-secondary" onClick={() => markRead(item.id)}>Mark read</button>}</article>)}</div></div></section>;
}
