import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import StatusBadge from "../../components/common/StatusBadge";

export default function FarmerProfile() {
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
        const farmer = data.farmer || {};
        setForm({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          phone: data.phone || "",
          farm_name: farmer.farm_name || "",
          address: farmer.address || "",
          district: farmer.district || "",
          state: farmer.state || "",
          land_size_acres: farmer.land_size_acres || "",
          khasra_number: farmer.khasra_number || "",
        });
      })
      .catch((requestError) => setError(requestError.message));
  }, []);

  const change = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    const data = new FormData();
    ["first_name", "last_name", "phone"].forEach((field) => data.append(field, form[field]));
    data.append("farmer", JSON.stringify({
      farm_name: form.farm_name,
      address: form.address,
      district: form.district,
      state: form.state,
      land_size_acres: form.land_size_acres,
      khasra_number: form.khasra_number,
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

  const farmer = profile.farmer || {};

  return (
    <div className="page-shell">
      <div className="container-page max-w-5xl">
        <span className="eyebrow">Farmer workspace</span>
        <h1 className="section-title">Your profile</h1>
        <p className="section-description">Keep your identity and farm details current for buyers and agreements.</p>

        {error && <p className="mt-5 text-sm font-bold text-red-600">{error}</p>}
        {notice && <p className="mt-5 rounded-xl bg-green-50 p-4 text-sm font-bold text-primary">{notice}</p>}

        <div className="profile-grid mt-8">
          <aside className="profile-summary">
            <ProfileHeader profile={profile} onAvatar={(event) => setAvatar(event.target.files[0])} />
            <div className="mt-6 grid gap-3 text-sm">
              <p><span className="text-slate-500">Farm:</span> <strong>{farmer.farm_name || "—"}</strong></p>
              <p><span className="text-slate-500">Location:</span> <strong>{farmer.district || "—"}, {farmer.state || "—"}</strong></p>
              <p><span className="text-slate-500">Land size:</span> <strong>{farmer.land_size_acres || "—"} acres</strong></p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-slate-500">Verification:</span>
                <StatusBadge status={farmer.verification_status || "PENDING"} variant="verification" />
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
              <Field label="Farm name" name="farm_name" value={form.farm_name} onChange={change} required />
              <Field label="Land size (acres)" name="land_size_acres" type="number" step="0.01" value={form.land_size_acres} onChange={change} required />
              <Field label="District" name="district" value={form.district} onChange={change} required />
              <Field label="State" name="state" value={form.state} onChange={change} required />
              <Field label="Khasra number" name="khasra_number" value={form.khasra_number} onChange={change} required />
            </div>
            <label>
              <span className="label">Farm address</span>
              <textarea className="input min-h-28" name="address" value={form.address} onChange={change} required />
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

function ProfileHeader({ profile, onAvatar }) {
  return (
    <div className="text-center">
      <div className="profile-avatar mx-auto">{profile.avatar_url ? <img src={profile.avatar_url} alt="Profile avatar" /> : `${profile.first_name?.[0] || "F"}${profile.last_name?.[0] || ""}`}</div>
      <h2 className="mt-4 font-heading text-xl font-extrabold text-navy">{`${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Farmer account"}</h2>
      <p className="text-sm text-slate-500">{profile.email}</p>
      <label className="mt-3 inline-block text-sm font-bold text-primary">
        <input className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" onChange={onAvatar} />
        Change avatar
      </label>
    </div>
  );
}

function Field({ label, name, value, onChange, type = "text", ...props }) {
  return (
    <label>
      <span className="label">{label}</span>
      <input className="input" name={name} type={type} value={value} onChange={onChange} {...props} />
    </label>
  );
}
