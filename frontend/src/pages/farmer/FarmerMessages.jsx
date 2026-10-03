import { useEffect, useState } from "react";
import { MessageSquare, Send, Trash2 } from "lucide-react";
import { apiRequest } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

export default function FarmerMessages() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [recipient, setRecipient] = useState("");
  const [contractId, setContractId] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [sending, setSending] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadMessages = () => apiRequest("/communications/messages/").then(setMessages).catch((requestError) => setError(requestError.message));

  useEffect(() => {
    loadMessages();
    apiRequest("/contracts/")
      .then((items) => {
        setContracts(items);
        const firstPartner = getPartner(items[0], user?.role);
        if (firstPartner) setRecipient(String(firstPartner.id));
      })
      .catch((requestError) => setError(requestError.message));
  }, [user?.role]);

  const recipients = [...new Map(contracts.map((contract) => {
    const partner = getPartner(contract, user?.role);
    return [partner?.id, partner];
  }).filter(([id]) => id)).values()];

  const selectedContract = contracts.find((contract) => String(contract.id) === String(contractId));

  const chooseContract = (value) => {
    setContractId(value);
    const partner = getPartner(contracts.find((contract) => String(contract.id) === String(value)), user?.role);
    if (partner) setRecipient(String(partner.id));
  };

  const send = async (event) => {
    event.preventDefault();
    setSending(true);
    setNotice("");
    setError("");
    try {
      await apiRequest("/communications/messages/", {
        method: "POST",
        body: JSON.stringify({ recipient: Number(recipient), contract: Number(contractId), subject, body }),
      });
      setSubject("");
      setBody("");
      setNotice("Message sent successfully.");
      await loadMessages();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSending(false);
    }
  };

  const deleteMessage = async (id) => {
    setDeletingId(id);
    setError("");
    try {
      await apiRequest(`/communications/messages/${id}/`, { method: "DELETE" });
      setMessages((current) => current.filter((message) => message.id !== id));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="section-padding min-h-screen bg-soft">
      <div className="container-page max-w-5xl">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="eyebrow">{t("communications") || "Communications"}</span>
            <h1 className="section-title">Messages</h1>
            <p className="section-description">Keep crop agreements, delivery updates, and payment conversations in one clear place.</p>
          </div>
          <div className="icon-box hidden sm:flex"><MessageSquare size={20} /></div>
        </div>

        {error && <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600">{error}</p>}
        {notice && <p className="mt-4 rounded-xl bg-green-50 p-4 text-sm font-bold text-primary">{notice}</p>}

        <form className="card mt-8 grid gap-4" onSubmit={send}>
          <div>
            <h2 className="font-heading text-xl font-bold text-navy">Start a conversation</h2>
            <p className="mt-1 text-sm text-slate-500">Choose the crop agreement so everyone sees the same context.</p>
          </div>
          <label><span className="label">Crop agreement</span><select className="input" value={contractId} onChange={(event) => chooseContract(event.target.value)} required><option value="">Select an agreement</option>{contracts.map((contract) => <option key={contract.id} value={contract.id}>{contract.crop_details?.name || "Crop"} · {getPartner(contract, user?.role)?.company_name || getPartner(contract, user?.role)?.farm_name || "Partner"}</option>)}</select></label>
          <label><span className="label">Partner</span><select className="input" value={recipient} onChange={(event) => setRecipient(event.target.value)} required><option value="">Select partner</option>{recipients.map((person) => <option key={person.id} value={person.id}>{person.company_name || person.farm_name || person.name || person.email}</option>)}</select></label>
          {selectedContract && <p className="rounded-xl bg-soft p-3 text-sm text-slate-600">Crop: <strong className="text-navy">{selectedContract.crop_details?.name || "Crop"}</strong> · Agreement #{selectedContract.id}</p>}
          <input className="input" placeholder="Subject" value={subject} onChange={(event) => setSubject(event.target.value)} required />
          <textarea className="input min-h-32" placeholder="Write your message" value={body} onChange={(event) => setBody(event.target.value)} required />
          <button className="btn-primary w-fit" disabled={sending || !contracts.length}><Send size={16} />{sending ? "Sending..." : "Send message"}</button>
          {!contracts.length && <p className="text-sm text-slate-500">Create or receive a contract before messaging a partner.</p>}
        </form>

        <div className="mt-8 grid gap-4">
          {messages.length === 0 && <p className="text-slate-500">No messages yet.</p>}
          {messages.map((message) => <article className="card" key={message.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{message.crop_name || "Conversation"}</p>
                <h2 className="mt-1 font-heading text-lg font-bold text-navy">{message.subject}</h2>
                <p className="mt-1 text-xs text-slate-500">{message.sender_display_name || message.sender_name} to {message.recipient_display_name || message.recipient_name} · {new Date(message.created_at).toLocaleString("en-IN")}</p>
              </div>
              {message.sender === user?.id && <button className="btn-icon text-red-600" title="Delete message" aria-label="Delete message" disabled={deletingId === message.id} onClick={() => deleteMessage(message.id)}><Trash2 size={17} /></button>}
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">{message.body}</p>
          </article>)}
        </div>
      </div>
    </section>
  );
}

function getPartner(contract, role) {
  if (!contract) return null;
  return role === "COMPANY" ? contract.farmer_details : contract.company_details;
}
