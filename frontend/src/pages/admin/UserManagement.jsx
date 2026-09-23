import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api";
import StatusBadge from "../../components/common/StatusBadge";

const USERS_ENDPOINT = "/admin/users/";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // ==========================================
  // Load Users
  // ==========================================
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiRequest(USERS_ENDPOINT);

      let userList = [];

      if (Array.isArray(response)) {
        userList = response;
      } else if (Array.isArray(response?.data)) {
        userList = response.data;
      } else if (Array.isArray(response?.users)) {
        userList = response.users;
      }

      setUsers(userList);
    } catch (requestError) {
      console.error("Failed to load users:", requestError);

      setError(
        requestError?.message ||
          "Unable to load users. Please check the backend API."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // ==========================================
  // Statistics
  // ==========================================
  const pendingCount = users.filter(
    (user) => user.verification_status === "PENDING"
  ).length;

  const verifiedUsers = users.filter(
    (user) => user.verification_status === "VERIFIED"
  );

  const unverifiedUsers = users.filter(
    (user) => user.verification_status !== "VERIFIED"
  );

  const activeUsers = users.filter(
    (user) => user.is_active === true
  ).length;

  // ==========================================
  // Helpers
  // ==========================================
  const getDisplayName = (user) => {
    return (
      user?.display_name ||
      user?.name ||
      user?.full_name ||
      user?.username ||
      user?.email ||
      "Unknown User"
    );
  };

  const getRoleName = (role) => {
    if (!role) return "Unknown";

    if (role === "COMPANY") return "Buyer";
    if (role === "FARMER") return "Farmer";
    if (role === "ADMIN") return "Admin";

    return role;
  };

  const formatDate = (date) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleDateString();
  };

  const formatKey = (key) => {
    return key
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  // ==========================================
  // Verification Update
  // ==========================================
  const updateVerification = async (user, decision) => {
    try {
      setUpdatingId(user.id);
      setError("");

      const updated = await apiRequest(USERS_ENDPOINT, {
        method: "POST",
        body: JSON.stringify({
          user_id: user.id,
          decision,
        }),
      });

      if (updated?.id) {
        setUsers((currentUsers) =>
          currentUsers.map((item) =>
            item.id === updated.id ? updated : item
          )
        );

        setSelectedUser(updated);
      } else {
        await loadUsers();

        setSelectedUser(null);
      }
    } catch (requestError) {
      console.error("Verification update failed:", requestError);

      setError(
        requestError?.message ||
          "Unable to update verification status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // ==========================================
  // Close Modal
  // ==========================================
  const closeUserModal = () => {
    setSelectedUser(null);
  };

  // ==========================================
  // User Details Modal
  // ==========================================
  const UserDetailsModal = ({ user }) => {
    if (!user) return null;

    const profile =
      user?.profile && typeof user.profile === "object"
        ? user.profile
        : {};

    const documents = Array.isArray(user?.documents)
      ? user.documents
      : [];

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
        onClick={closeUserModal}
      >
        <div
          className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          {/* ================================= */}
          {/* Modal Header */}
          {/* ================================= */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Registration Details
              </span>

              <h2 className="mt-1 text-2xl font-extrabold text-slate-900">
                {getDisplayName(user)}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {getRoleName(user.role)}
              </p>
            </div>

            <button
              type="button"
              onClick={closeUserModal}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* ================================= */}
          {/* Modal Content */}
          {/* ================================= */}
          <div className="p-6">
            {/* User Header Card */}
            <div className="flex flex-col gap-5 rounded-xl border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center">
              {/* Avatar */}
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-2xl font-extrabold text-white">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={getDisplayName(user)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  getDisplayName(user)
                    .charAt(0)
                    .toUpperCase()
                )}
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-extrabold text-slate-900">
                  {getDisplayName(user)}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {user.email || "No email"}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <StatusBadge
                    status={
                      user.verification_status || "PENDING"
                    }
                    variant="verification"
                  />

                  <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-700">
                    {getRoleName(user.role)}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      user.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {user.is_active
                      ? "Active"
                      : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            {/* ================================= */}
            {/* Basic Information */}
            {/* ================================= */}
            <div className="mt-7">
              <h3 className="text-lg font-extrabold text-slate-900">
                Basic Information
              </h3>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <InfoItem
                  label="Full Name"
                  value={getDisplayName(user)}
                />

                <InfoItem
                  label="Email"
                  value={user.email}
                />

                <InfoItem
                  label="Phone"
                  value={user.phone}
                />

                <InfoItem
                  label="Role"
                  value={getRoleName(user.role)}
                />

                <InfoItem
                  label="Verification Status"
                  value={user.verification_status}
                />

                <InfoItem
                  label="Account Status"
                  value={
                    user.is_active
                      ? "Active"
                      : "Inactive"
                  }
                />

                <InfoItem
                  label="Joined"
                  value={formatDate(user.date_joined)}
                />
              </div>
            </div>

            {/* ================================= */}
            {/* Profile Information */}
            {/* ================================= */}
            {Object.keys(profile).length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-extrabold text-slate-900">
                  Profile Information
                </h3>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {Object.entries(profile).map(
                    ([key, value]) => {
                      if (
                        value === null ||
                        value === undefined ||
                        typeof value === "object"
                      ) {
                        return null;
                      }

                      return (
                        <InfoItem
                          key={key}
                          label={formatKey(key)}
                          value={String(value)}
                        />
                      );
                    }
                  )}
                </div>
              </div>
            )}

            {/* ================================= */}
            {/* Documents */}
            {/* ================================= */}
            <div className="mt-8">
              <h3 className="text-lg font-extrabold text-slate-900">
                Verification Documents
              </h3>

              {documents.length > 0 ? (
                <div className="mt-4 grid gap-3">
                  {documents.map(
                    (document, index) => (
                      <div
                        key={
                          document?.url ||
                          document?.id ||
                          index
                        }
                        className="flex items-center justify-between rounded-lg border border-slate-200 p-4"
                      >
                        <div>
                          <p className="font-bold text-slate-800">
                            {document?.name ||
                              document?.title ||
                              `Document ${index + 1}`}
                          </p>
                        </div>

                        {document?.url && (
                          <a
                            href={document.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-bold text-primary underline"
                          >
                            View
                          </a>
                        )}
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-500">
                  No verification documents uploaded.
                </p>
              )}
            </div>

            {/* ================================= */}
            {/* Actions */}
            {/* ================================= */}
            <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-6">
              <button
                type="button"
                onClick={closeUserModal}
                className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Close
              </button>

              {user.verification_status ===
              "VERIFIED" ? (
                <button
                  type="button"
                  disabled={updatingId === user.id}
                  onClick={() =>
                    updateVerification(
                      user,
                      "reject"
                    )
                  }
                  className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {updatingId === user.id
                    ? "Updating..."
                    : "Reject User"}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={updatingId === user.id}
                  onClick={() =>
                    updateVerification(
                      user,
                      "verify"
                    )
                  }
                  className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {updatingId === user.id
                    ? "Updating..."
                    : "Verify User"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // Info Item
  // ==========================================
  const InfoItem = ({ label, value }) => {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold text-slate-800">
          {value || "Not provided"}
        </p>
      </div>
    );
  };

  // ==========================================
  // User Table
  // ==========================================
  const UserSection = ({
    title,
    sectionUsers,
  }) => {
    return (
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-slate-900">
            {title} ({sectionUsers.length})
          </h2>
        </div>

        <div className="table-wrap mt-4 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Verification</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {sectionUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="py-8 text-center text-sm text-slate-500"
                  >
                    No users in this section.
                  </td>
                </tr>
              ) : (
                sectionUsers.map((user) => (
                  <tr key={user.id}>
                    {/* Name */}
                    <td>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedUser(user)
                        }
                        className="font-bold text-primary hover:underline"
                      >
                        {getDisplayName(user)}
                      </button>
                    </td>

                    {/* Email */}
                    <td>
                      {user.email || "Not provided"}
                    </td>

                    {/* Role */}
                    <td>
                      {getRoleName(user.role)}
                    </td>

                    {/* Verification */}
                    <td>
                      <StatusBadge
                        status={
                          user.verification_status ||
                          "PENDING"
                        }
                        variant="verification"
                      />
                    </td>

                    {/* Joined */}
                    <td>
                      {formatDate(user.date_joined)}
                    </td>

                    {/* Actions */}
                    <td>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedUser(user)
                        }
                        className="text-sm font-bold text-primary hover:underline"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    );
  };

  // ==========================================
  // Main UI
  // ==========================================
  return (
    <div className="page-shell">
      <div className="container-page">
        {/* Page Header */}
        <span className="eyebrow">
          Admin console
        </span>

        <h1 className="section-title">
          Users & Verification
        </h1>

        <p className="section-description">
          Review farmer and buyer accounts,
          verification status, and account activity.
        </p>

        {/* ================================= */}
        {/* Metrics */}
        {/* ================================= */}
        <div className="metric-grid mt-8">
          <div className="metric-card">
            <p>Total users</p>
            <strong>{users.length}</strong>
          </div>

          <div className="metric-card">
            <p>Pending verification</p>
            <strong>{pendingCount}</strong>
          </div>

          <div className="metric-card">
            <p>Active accounts</p>
            <strong>{activeUsers}</strong>
          </div>

          <div className="metric-card">
            <p>Verified users</p>
            <strong>{verifiedUsers.length}</strong>
          </div>
        </div>

        {/* ================================= */}
        {/* Error */}
        {/* ================================= */}
        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-bold text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={loadUsers}
              className="mt-2 text-sm font-bold text-red-700 underline"
            >
              Try Again
            </button>
          </div>
        )}

        {/* ================================= */}
        {/* Loading */}
        {/* ================================= */}
        {loading ? (
          <div className="mt-8">
            <p className="text-sm font-bold text-slate-400">
              Loading users...
            </p>
          </div>
        ) : (
          <>
            <UserSection
              title="Not Verified Users"
              sectionUsers={unverifiedUsers}
            />

            <UserSection
              title="Verified Users"
              sectionUsers={verifiedUsers}
            />
          </>
        )}

        {/* ================================= */}
        {/* USER DETAILS POPUP */}
        {/* ================================= */}
        {selectedUser && (
          <UserDetailsModal user={selectedUser} />
        )}
      </div>
    </div>
  );
}