import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { apiRequest } from "../../lib/api";
import StatusBadge from "../../components/common/StatusBadge";
import { formatCurrency, formatStatus } from "../../lib/display";

const COLORS = ["#1e7d32", "#69a879", "#f0b44d", "#2457a6", "#b42318", "#64748b"];

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      apiRequest("/admin/summary/"),
      apiRequest("/admin/contracts/"),
      apiRequest("/admin/payments/"),
      apiRequest("/admin/users/"),
    ])
      .then(([summaryData, contractData, paymentData, userData]) => {
        setSummary(summaryData);
        setContracts(contractData);
        setPayments(paymentData);
        setUsers(userData);
      })
      .catch((requestError) => setError(requestError.message));
  }, []);

  const statusData = Object.entries(
    contracts.reduce((result, contract) => {
      result[contract.status] = (result[contract.status] || 0) + 1;
      return result;
    }, {})
  ).map(([name, value]) => ({ name: formatStatus(name), value }));

  const roleData = summary
    ? [
        { name: "Farmers", value: summary.farmers },
        { name: "Buyers", value: summary.companies },
      ]
    : [];

  const paymentData = Object.entries(
    payments.reduce((result, payment) => {
      const label = payment.transaction_type === "FUNDING" ? "Escrow funding" : "Milestone release";
      result[label] = (result[label] || 0) + Number(payment.amount || 0);
      return result;
    }, {})
  ).map(([name, amount]) => ({ name, amount }));

  const pendingUsers = users.filter((user) => user.verification_status === "PENDING").slice(0, 5);

  return (
    <div className="page-shell">
      <div className="container-page">
        <span className="eyebrow">Admin console</span>
        <h1 className="section-title">Platform overview</h1>
        <p className="section-description">
          Monitor user verification, agreements, escrow activity, and disputes from one place.
        </p>

        {error && <p className="mt-4 text-sm font-bold text-red-600">{error}</p>}

        <div className="metric-grid mt-8">
          <Metric label="Total users" value={summary?.users ?? "—"} />
          <Metric label="Active agreements" value={summary?.active_contracts ?? "—"} />
          <Metric label="Pending verification" value={summary?.pending_verifications ?? "—"} highlight />
          <Metric label="Open disputes" value={summary?.open_disputes ?? "—"} />
          <Metric label="Payment records" value={summary?.payments ?? "—"} />
          <Metric label="Crop updates" value={summary?.crop_updates ?? "—"} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <ChartCard title="Agreements by status">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#1e7d32" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="User participation">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={roleData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={92} label>
                  {roleData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Payment activity">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={paymentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Area type="monotone" dataKey="amount" stroke="#2457a6" fill="#dbeafe" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <div className="chart-card">
            <div className="flex items-center justify-between gap-3">
              <h2>Verification queue</h2>
              <Link to="/admin/users" className="text-sm font-bold text-primary">View all users</Link>
            </div>
            <div className="mt-4 grid gap-3">
              {pendingUsers.length === 0 && (
                <p className="text-sm text-slate-500">No users waiting for verification.</p>
              )}
              {pendingUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between gap-3 rounded-2xl bg-soft p-4">
                  <div>
                    <p className="font-bold text-navy">{user.display_name}</p>
                    <p className="text-xs text-slate-500">{user.email} · {user.role}</p>
                  </div>
                  <StatusBadge status={user.verification_status} variant="verification" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 chart-card">
          <h2>Quick actions</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            {[
              ["Review users", "/admin/users"],
              ["Monitor agreements", "/admin/contracts"],
              ["Check payments", "/admin/payments"],
              ["Resolve disputes", "/admin/disputes"],
              ["Open analytics", "/admin/analytics"],
            ].map(([label, to]) => (
              <Link className="btn-secondary" to={to} key={to}>{label}</Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, highlight }) {
  return (
    <div className={`metric-card${highlight ? " border-amber-200 bg-amber-50/40" : ""}`}>
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="chart-card">
      <h2>{title}</h2>
      <div className="chart-body">{children}</div>
    </div>
  );
}
