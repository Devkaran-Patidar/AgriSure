import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api";
import StatusBadge from "../../components/common/StatusBadge";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest("/admin/users/")
      .then(setUsers)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  const pendingCount = users.filter((user) => user.verification_status === "PENDING").length;

  return (
    <div className="page-shell">
      <div className="container-page">
        <span className="eyebrow">Admin console</span>
        <h1 className="section-title">Users & verification</h1>
        <p className="section-description">
          Review farmer and buyer accounts, verification status, and account activity.
        </p>

        <div className="metric-grid mt-8">
          <div className="metric-card"><p>Total users</p><strong>{users.length}</strong></div>
          <div className="metric-card"><p>Pending verification</p><strong>{pendingCount}</strong></div>
          <div className="metric-card"><p>Active accounts</p><strong>{users.filter((user) => user.is_active).length}</strong></div>
        </div>

        {error && <p className="mt-4 text-sm font-bold text-red-600">{error}</p>}
        {loading ? (
          <p className="mt-8 text-sm font-bold text-slate-400">Loading users...</p>
        ) : (
          <div className="table-wrap mt-8">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Verification</th>
                  <th>Account</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan="6" className="text-center">No users found.</td></tr>
                ) : users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.display_name}</td>
                    <td>{user.email}</td>
                    <td>{user.role === "COMPANY" ? "Buyer" : user.role}</td>
                    <td><StatusBadge status={user.verification_status} variant="verification" /></td>
                    <td>{user.is_active ? "Active" : "Inactive"}</td>
                    <td>{new Date(user.date_joined).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
