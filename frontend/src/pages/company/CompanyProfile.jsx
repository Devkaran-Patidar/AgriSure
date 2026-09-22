import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import StatusBadge from "../../components/common/StatusBadge";

export default function CompanyProfile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const { updateUser } = useAuth();

  useEffect(() => {
    apiRequest("/accounts/auth/profile/")
      .then((data) => {
        setProfile(data);
        setForm({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          phone: data.phone || "",
          company_name: data.company?.company_name || "",
          business_type: data.company?.business_type || "",
          contact_person: data.company?.contact_person || "",
          company_address: data.company?.company_address || "",
          gst_number: data.company?.gst_number || "",
          licence_number: data.company?.licence_number || "",
        });
      })
      .catch((requestError) => setError(requestError.message));
  }, []);

  if (error && !profile) {
    return (
      <div className="page-shell">
        <div className="container-page"><p className="text-sm font-bold text-red-600">{error}</p></div>
      </div>
    );
  }

  if (!profile || !form) {
    return <div className="grid min-h-[60vh] place-items-center">Loading profile...</div>;
  }

  const company = profile.company || {};
  const change = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    const data = new FormData();
    ["first_name", "last_name", "phone"].forEach((field) => data.append(field, form[field]));
    data.append("company", JSON.stringify({
      company_name: form.company_name,
      business_type: form.business_type,
      contact_person: form.contact_person,
      company_address: form.company_address,
      gst_number: form.gst_number,
      licence_number: form.licence_number,
    }));
    if (avatar) data.append("avatar", avatar);
    try {
      const updated = await apiRequest("/accounts/auth/profile/", { method: "PATCH", body: data });
      updateUser(updated);
      setProfile(updated);
      setAvatar(null);
      setNotice("Profile updated successfully.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="container-page max-w-5xl">
        <span className="eyebrow">Buyer workspace</span>
        <h1 className="section-title">Company profile</h1>
        <p className="section-description">Keep your business identity and procurement details current for farmers.</p>

        {error && <p className="mt-5 text-sm font-bold text-red-600">{error}</p>}
        {notice && <p className="mt-5 rounded-xl bg-green-50 p-4 text-sm font-bold text-primary">{notice}</p>}

        <div className="profile-grid mt-8">
          <aside className="profile-summary">
            <ProfileHeader profile={profile} company={company} onAvatar={(event) => setAvatar(event.target.files[0])} />
            <div className="mt-6 grid gap-3 text-sm">
              <p><span className="text-slate-500">Business type:</span> <strong>{company.business_type || "—"}</strong></p>
              <p><span className="text-slate-500">Contact:</span> <strong>{company.contact_person || "—"}</strong></p>
              <p><span className="text-slate-500">GST:</span> <strong>{company.gst_number || "Not provided"}</strong></p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-slate-500">Verification:</span>
                <StatusBadge status={company.verification_status || "PENDING"} variant="verification" />
              </div>
            </div>
          </aside>

          <form className="card grid gap-6" onSubmit={save}>
            <h2 className="font-heading text-xl font-extrabold text-navy">Edit details</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="First name" name="first_name" value={form.first_name} onChange={change} required />
              <Field label="Last name" name="last_name" value={form.last_name} onChange={change} />
              <Field label="Phone" name="phone" value={form.phone} onChange={change} />
              <div><span className="label">Email</span><p className="input bg-slate-50 text-slate-500">{profile.email}</p></div>
              <Field label="Company name" name="company_name" value={form.company_name} onChange={change} required />
              <Field label="Business type" name="business_type" value={form.business_type} onChange={change} required />
              <Field label="Contact person" name="contact_person" value={form.contact_person} onChange={change} required />
              <Field label="GST number" name="gst_number" value={form.gst_number} onChange={change} />
              <Field label="Licence number" name="licence_number" value={form.licence_number} onChange={change} />
            </div>
            <label>
              <span className="label">Company address</span>
              <textarea className="input min-h-28" name="company_address" value={form.company_address} onChange={change} required />
            </label>
            <div className="flex justify-end">
              <button className="btn-primary" disabled={saving}>{saving ? "Saving..." : "Save profile"}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function ProfileHeader({ profile, company, onAvatar }) {
  return (
    <div className="text-center">
      <div className="profile-avatar mx-auto">{profile.avatar_url ? <img src={profile.avatar_url} alt="Profile avatar" /> : `${profile.first_name?.[0] || "B"}${profile.last_name?.[0] || ""}`}</div>
      <h2 className="mt-4 font-heading text-xl font-extrabold text-navy">{company.company_name || "Buyer account"}</h2>
      <p className="text-sm text-slate-500">{profile.email}</p>
      <label className="mt-3 inline-block text-sm font-bold text-primary">
        <input className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" onChange={onAvatar} />
        Change avatar
      </label>
    </div>
  );
}

function Field({ label, name, value, onChange, ...props }) {
  return (
    <label>
      <span className="label">{label}</span>
      <input className="input" name={name} value={value} onChange={onChange} {...props} />
    </label>
  );
}
