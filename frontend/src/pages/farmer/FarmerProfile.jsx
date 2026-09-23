
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
  const [editing, setEditing] = useState(false);

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
          aadhar_number: farmer.aadhar_number || "",
          pan_number: farmer.pan_number || "",
          bank_account_number: farmer.bank_account_number || "",
          ifsc_code: farmer.ifsc_code || "",
          bank_name: farmer.bank_name || "",
          branch_name: farmer.branch_name || "",
          current_password: "",
          new_password: "",
        });
      })
      .catch((requestError) => setError(requestError.message));
  }, []);

  const createForm = (data) => {
    const farmer = data.farmer || {};

    return {
      first_name: data.first_name || "",
      last_name: data.last_name || "",
      phone: data.phone || "",
      farm_name: farmer.farm_name || "",
      address: farmer.address || "",
      district: farmer.district || "",
      state: farmer.state || "",
      land_size_acres: farmer.land_size_acres || "",
      khasra_number: farmer.khasra_number || "",
      aadhar_number: farmer.aadhar_number || "",
      pan_number: farmer.pan_number || "",
      bank_account_number: farmer.bank_account_number || "",
      ifsc_code: farmer.ifsc_code || "",
      bank_name: farmer.bank_name || "",
      branch_name: farmer.branch_name || "",
      current_password: "",
      new_password: "",
    };
  };

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
    setForm(createForm(profile));
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
      "farmer",
      JSON.stringify({
        farm_name: form.farm_name,
        address: form.address,
        district: form.district,
        state: form.state,
        land_size_acres: form.land_size_acres,
        khasra_number: form.khasra_number,
        aadhar_number: form.aadhar_number,
        pan_number: form.pan_number,
        bank_account_number: form.bank_account_number,
        ifsc_code: form.ifsc_code,
        bank_name: form.bank_name,
        branch_name: form.branch_name,
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
      const updated = await apiRequest(
        "/accounts/auth/profile/",
        {
          method: "PATCH",
          body: data,
        }
      );

      updateUser(updated);
      setProfile(updated);
      setForm(createForm(updated));
      setAvatar(null);
      setEditing(false);
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
        <div className="container-page">
          <p className="text-sm font-bold text-red-600">
            {error}
          </p>
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

  const farmer = profile.farmer || {};

  return (
    <div className="page-shell">
      <div className="container-page max-w-5xl">

        <span className="eyebrow">
          Farmer workspace
        </span>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="section-title">
              Your Profile
            </h1>

            <p className="section-description">
              View and manage your personal and farm information.
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
            farmer={farmer}
          />
        ) : (
          <EditProfile
            profile={profile}
            farmer={farmer}
            form={form}
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


/* =========================
   PROFILE CARD
========================= */

function ProfileCard({ profile, farmer }) {
  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      {/* Profile Header */}
      <div className="border-b border-slate-200 bg-slate-50 p-6">
        <div className="flex flex-col items-center gap-5 sm:flex-row">

          <div className="profile-avatar">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Farmer profile"
              />
            ) : (
              `${profile.first_name?.[0] || "F"}${
                profile.last_name?.[0] || ""
              }`
            )}
          </div>

          <div className="text-center sm:text-left">

            <h2 className="font-heading text-2xl font-extrabold text-navy">
              {`${profile.first_name || ""} ${
                profile.last_name || ""
              }`.trim() || "Farmer Account"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {profile.email}
            </p>

            <div className="mt-3">
              <StatusBadge
                status={
                  farmer.verification_status || "PENDING"
                }
                variant="verification"
              />
            </div>

          </div>

        </div>
      </div>


      {/* Personal & Farm Details */}
      <div className="grid gap-6 p-6 sm:grid-cols-2">

        <ProfileItem
          label="Farm Name"
          value={farmer.farm_name}
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
          label="Land Size"
          value={
            farmer.land_size_acres
              ? `${farmer.land_size_acres} acres`
              : null
          }
        />

        <ProfileItem
          label="District"
          value={farmer.district}
        />

        <ProfileItem
          label="State"
          value={farmer.state}
        />

        <ProfileItem
          label="Khasra Number"
          value={farmer.khasra_number}
        />

        <ProfileItem
          label="Aadhaar Number"
          value={farmer.aadhar_number}
        />

        <ProfileItem
          label="PAN Number"
          value={farmer.pan_number}
        />

        <ProfileItem
          label="Bank Name"
          value={farmer.bank_name}
        />

        <ProfileItem
          label="Bank Account Number"
          value={farmer.bank_account_number}
        />

        <ProfileItem
          label="IFSC Code"
          value={farmer.ifsc_code}
        />

        <ProfileItem
          label="Branch Name"
          value={farmer.branch_name}
        />

        <div className="sm:col-span-2">
          <ProfileItem
            label="Farm Address"
            value={farmer.address}
          />
        </div>

      </div>


      {/* Documents */}
      <div className="border-t border-slate-200 p-6">

        <h3 className="font-heading font-bold text-navy">
          Verification Documents
        </h3>

        <DocumentList
          documents={farmer.verification_documents}
        />

      </div>

    </div>
  );
}


/* =========================
   PROFILE ITEM
========================= */

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


/* =========================
   EDIT PROFILE
========================= */

function EditProfile({
  profile,
  farmer,
  form,
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

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h2 className="font-heading text-xl font-extrabold text-navy">
            Edit Farmer Profile
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Update your personal and farm information.
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


      {/* Avatar */}
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
            `${profile.first_name?.[0] || "F"}${
              profile.last_name?.[0] || ""
            }`
          )}

        </div>

        <div>
          <p className="font-bold text-navy">
            {farmer.farm_name || "Farmer Account"}
          </p>

          <p className="text-sm text-slate-500">
            {profile.email}
          </p>
        </div>

      </div>


      {/* Personal Information */}
      <div>
        <h3 className="mb-4 font-heading font-bold text-navy">
          Personal Information
        </h3>

        <div className="grid gap-5 sm:grid-cols-2">

          <Field
            label="First name"
            name="first_name"
            value={form.first_name}
            onChange={change}
            required
          />

          <Field
            label="Last name"
            name="last_name"
            value={form.last_name}
            onChange={change}
          />

          <Field
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={change}
          />

          <div>
            <span className="label">
              Email
            </span>

            <p className="input bg-slate-50 text-slate-500">
              {profile.email}
            </p>
          </div>

        </div>
      </div>


      {/* Farm Information */}
      <div className="border-t border-slate-200 pt-6">

        <h3 className="mb-4 font-heading font-bold text-navy">
          Farm Information
        </h3>

        <div className="grid gap-5 sm:grid-cols-2">

          <Field
            label="Farm name"
            name="farm_name"
            value={form.farm_name}
            onChange={change}
            required
          />

          <Field
            label="Land size (acres)"
            name="land_size_acres"
            type="number"
            step="0.01"
            value={form.land_size_acres}
            onChange={change}
            required
          />

          <Field
            label="District"
            name="district"
            value={form.district}
            onChange={change}
            required
          />

          <Field
            label="State"
            name="state"
            value={form.state}
            onChange={change}
            required
          />

          <Field
            label="Khasra number"
            name="khasra_number"
            value={form.khasra_number}
            onChange={change}
            required
          />

        </div>

      </div>


      {/* Identity Information */}
      <div className="border-t border-slate-200 pt-6">

        <h3 className="mb-4 font-heading font-bold text-navy">
          Identity Information
        </h3>

        <div className="grid gap-5 sm:grid-cols-2">

          <Field
            label="Aadhaar number"
            name="aadhar_number"
            value={form.aadhar_number}
            onChange={change}
          />

          <Field
            label="PAN number"
            name="pan_number"
            value={form.pan_number}
            onChange={change}
          />

        </div>

      </div>


      {/* Banking Information */}
      <div className="border-t border-slate-200 pt-6">

        <h3 className="mb-4 font-heading font-bold text-navy">
          Banking Information
        </h3>

        <div className="grid gap-5 sm:grid-cols-2">

          <Field
            label="Bank account number"
            name="bank_account_number"
            value={form.bank_account_number}
            onChange={change}
          />

          <Field
            label="IFSC code"
            name="ifsc_code"
            value={form.ifsc_code}
            onChange={change}
          />

          <Field
            label="Bank name"
            name="bank_name"
            value={form.bank_name}
            onChange={change}
          />

          <Field
            label="Branch name"
            name="branch_name"
            value={form.branch_name}
            onChange={change}
          />

        </div>

      </div>


      {/* Address */}
      <label>
        <span className="label">
          Farm address
        </span>

        <textarea
          className="input min-h-28"
          name="address"
          value={form.address}
          onChange={change}
          required
        />
      </label>


      {/* Password */}
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


      {/* Documents */}
      <DocumentList
        documents={farmer.verification_documents}
      />


      {/* Actions */}
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


/* =========================
   FIELD
========================= */

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
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
        type={type}
        value={value}
        onChange={onChange}
        {...props}
      />
    </label>
  );
}


/* =========================
   DOCUMENT LIST
========================= */

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