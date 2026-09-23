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
  const [editing, setEditing] = useState(false);

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
          current_password: "",
          new_password: "",
        });
      })
      .catch((requestError) => setError(requestError.message));
  }, []);

  if (error && !profile) {
    return (
      <div className="page-shell">
        <div className="container-page">
          <p className="text-sm font-bold text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!profile || !form) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        Loading profile...
      </div>
    );
  }

  const company = profile.company || {};

  const change = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const startEditing = () => {
    setError("");
    setNotice("");
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setAvatar(null);
    setError("");

    setForm({
      first_name: profile.first_name || "",
      last_name: profile.last_name || "",
      phone: profile.phone || "",
      company_name: profile.company?.company_name || "",
      business_type: profile.company?.business_type || "",
      contact_person: profile.company?.contact_person || "",
      company_address: profile.company?.company_address || "",
      gst_number: profile.company?.gst_number || "",
      licence_number: profile.company?.licence_number || "",
      current_password: "",
      new_password: "",
    });
  };

  const save = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setNotice("");

    const data = new FormData();

    ["first_name", "last_name", "phone"].forEach((field) => {
      data.append(field, form[field]);
    });

    data.append(
      "company",
      JSON.stringify({
        company_name: form.company_name,
        business_type: form.business_type,
        contact_person: form.contact_person,
        company_address: form.company_address,
        gst_number: form.gst_number,
        licence_number: form.licence_number,
      })
    );

    if (form.new_password) {
      data.append("current_password", form.current_password);
      data.append("new_password", form.new_password);
    }

    if (avatar) {
      data.append("avatar", avatar);
    }

    try {
      const updated = await apiRequest("/accounts/auth/profile/", {
        method: "PATCH",
        body: data,
      });

      updateUser(updated);
      setProfile(updated);
      setAvatar(null);
      setEditing(false);
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

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="section-title">Company Profile</h1>
            <p className="section-description">
              View and manage your company information.
            </p>
          </div>

          {!editing && (
            <button
              type="button"
              onClick={startEditing}
              className="btn-primary"
            >
              Edit Profile
            </button>
          )}
        </div>

        {error && (
          <p className="mt-5 text-sm font-bold text-red-600">
            {error}
          </p>
        )}

        {notice && (
          <p className="mt-5 rounded-xl bg-green-50 p-4 text-sm font-bold text-primary">
            {notice}
          </p>
        )}

        {!editing ? (
          <ProfileCard
            profile={profile}
            company={company}
          />
        ) : (
          <EditProfile
            profile={profile}
            form={form}
            company={company}
            avatar={avatar}
            setAvatar={setAvatar}
            change={change}
            save={save}
            cancelEditing={cancelEditing}
            saving={saving}
          />
        )}
      </div>
    </div>
  );
}

function ProfileCard({ profile, company }) {
  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      <div className="border-b border-slate-200 bg-slate-50 p-6">
        <div className="flex flex-col items-center gap-5 sm:flex-row">

          <div className="profile-avatar">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Company profile"
              />
            ) : (
              `${profile.first_name?.[0] || "B"}${
                profile.last_name?.[0] || ""
              }`
            )}
          </div>

          <div className="text-center sm:text-left">
            <h2 className="font-heading text-2xl font-extrabold text-navy">
              {company.company_name || "Buyer Account"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {profile.email}
            </p>

            <div className="mt-3">
              <StatusBadge
                status={company.verification_status || "PENDING"}
                variant="verification"
              />
            </div>
          </div>

        </div>
      </div>

      <div className="grid gap-6 p-6 sm:grid-cols-2">

        <ProfileItem
          label="Business Type"
          value={company.business_type}
        />

        <ProfileItem
          label="Contact Person"
          value={company.contact_person}
        />

        <ProfileItem
          label="Phone"
          value={profile.phone}
        />

        <ProfileItem
          label="Email"
          value={profile.email}
        />

        <ProfileItem
          label="GST Number"
          value={company.gst_number}
        />

        <ProfileItem
          label="Licence Number"
          value={company.licence_number}
        />

        <div className="sm:col-span-2">
          <ProfileItem
            label="Company Address"
            value={company.company_address}
          />
        </div>

      </div>

      <div className="border-t border-slate-200 p-6">
        <h3 className="font-heading font-bold text-navy">
          Verification Documents
        </h3>

        <DocumentList
          documents={company.verification_documents}
        />
      </div>

    </div>
  );
}

function ProfileItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 font-semibold text-slate-800">
        {value || "Not provided"}
      </p>
    </div>
  );
}

function EditProfile({
  profile,
  form,
  company,
  avatar,
  setAvatar,
  change,
  save,
  cancelEditing,
  saving,
}) {
  return (
    <form
      className="card mt-8 grid gap-6"
      onSubmit={save}
    >

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h2 className="font-heading text-xl font-extrabold text-navy">
            Edit Company Profile
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Update your company and contact information.
          </p>
        </div>

        <label className="cursor-pointer text-sm font-bold text-primary">
          Change avatar

          <input
            className="sr-only"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) =>
              setAvatar(event.target.files[0])
            }
          />
        </label>

      </div>

      <div className="flex items-center gap-4 border-b border-slate-200 pb-6">

        <div className="profile-avatar">
          {avatar ? (
            <img
              src={URL.createObjectURL(avatar)}
              alt="New avatar"
            />
          ) : profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="Profile avatar"
            />
          ) : (
            `${profile.first_name?.[0] || "B"}${
              profile.last_name?.[0] || ""
            }`
          )}
        </div>

        <div>
          <p className="font-bold text-navy">
            {company.company_name || "Buyer account"}
          </p>

          <p className="text-sm text-slate-500">
            {profile.email}
          </p>
        </div>

      </div>

      <div className="grid gap-5 sm:grid-cols-2">

        <Field
          label="Company name"
          name="company_name"
          value={form.company_name}
          onChange={change}
          required
        />

        <Field
          label="Business type"
          name="business_type"
          value={form.business_type}
          onChange={change}
          required
        />

        <Field
          label="GST number"
          name="gst_number"
          value={form.gst_number}
          onChange={change}
        />

        <Field
          label="Licence number"
          name="licence_number"
          value={form.licence_number}
          onChange={change}
        />

        <Field
          label="Contact person"
          name="contact_person"
          value={form.contact_person}
          onChange={change}
          required
        />

        <Field
          label="Phone"
          name="phone"
          value={form.phone}
          onChange={change}
        />

      </div>

      <div>
        <span className="label">Email</span>

        <p className="input bg-slate-50 text-slate-500">
          {profile.email}
        </p>
      </div>

      <label>
        <span className="label">
          Company address
        </span>

        <textarea
          className="input min-h-28"
          name="company_address"
          value={form.company_address}
          onChange={change}
          required
        />
      </label>

      <div className="border-t border-slate-200 pt-6">

        <h3 className="font-heading font-bold text-navy">
          Change Password
        </h3>

        <div className="mt-4 grid gap-5 sm:grid-cols-2">

          <Field
            label="Current password"
            name="current_password"
            type="password"
            value={form.current_password}
            onChange={change}
          />

          <Field
            label="New password"
            name="new_password"
            type="password"
            value={form.new_password}
            onChange={change}
            minLength={8}
          />

        </div>

      </div>

      <DocumentList
        documents={company.verification_documents}
      />

      <div className="flex justify-end gap-3 border-t border-slate-200 pt-6">

        <button
          type="button"
          onClick={cancelEditing}
          className="rounded-xl border border-slate-300 px-5 py-2.5 font-bold text-slate-700 hover:bg-slate-50"
          disabled={saving}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="btn-primary"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

      </div>

    </form>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  ...props
}) {
  return (
    <label>
      <span className="label">
        {label}
      </span>

      <input
        className="input"
        name={name}
        value={value}
        onChange={onChange}
        {...props}
      />
    </label>
  );
}

function DocumentList({ documents = [] }) {
  return (
    <div>
      {documents.length > 0 ? (
        <ul className="mt-3 grid gap-2 text-sm">
          {documents.map((document, index) => (
            <li key={document}>
              <a
                className="font-bold text-primary underline"
                href={document}
                target="_blank"
                rel="noreferrer"
              >
                Document {index + 1}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-slate-500">
          No documents uploaded.
        </p>
      )}
    </div>
  );
}
