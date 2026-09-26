import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  FileText,
  Gavel,
  RefreshCcw,
  ShieldCheck,
  Sprout,
  Users,
  Wallet,
} from "lucide-react";
import { apiRequest } from "../../lib/api";
import StatusBadge from "../../components/common/StatusBadge";
import { formatCurrency, formatStatus } from "../../lib/display";

const COLORS = ["#1e7d32", "#69a879", "#f0b44d", "#2457a6", "#b42318", "#64748b"];

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadAll = () => {
    setLoading(true);
    setError("");
    Promise.all([
      apiRequest("/admin/summary/"),
      apiRequest("/admin/contracts/"),
      apiRequest("/admin/payments/"),
      apiRequest("/admin/users/"),
      apiRequest("/admin/disputes/"),
    ])
      .then(([summaryData, contractData, paymentData, userData, disputeData]) => {
        setSummary(summaryData);
        setContracts(contractData);
        setPayments(paymentData);
        setUsers(userData);
        setDisputes(disputeData);
        setLastUpdated(new Date());
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  };

  useEffect(loadAll, []);

  const statusData = useMemo(
    () =>
      Object.entries(
        contracts.reduce((result, contract) => {
          result[contract.status] = (result[contract.status] || 0) + 1;
          return result;
        }, {})
      ).map(([name, value]) => ({ name: formatStatus(name), value })),
    [contracts]
  );

  const roleData = summary
    ? [
        { name: "Farmers", value: summary.farmers },
        { name: "Buyers", value: summary.companies },
      ]
    : [];

  // Escrow volume by month, derived from payment created_at, trailing 6 months
  const volumeTrend = useMemo(() => buildMonthlyTrend(payments, "amount"), [payments]);
  // Agreements opened by month
  const agreementTrend = useMemo(() => buildMonthlyTrend(contracts, null), [contracts]);

  const pendingUsers = users.filter((user) => user.verification_status === "PENDING").slice(0, 5);
  const urgentDisputes = [...disputes]
    .filter((dispute) => dispute.status !== "RESOLVED" && dispute.status !== "REJECTED")
    .sort((a, b) => priorityWeight(b.priority) - priorityWeight(a.priority))
    .slice(0, 5);

  const verificationRate = summary && summary.users
    ? Math.round(((summary.users - summary.pending_verifications) / summary.users) * 100)
    : null;

  return (
    <div className="page-shell">
      <div className="container-page">
        <div className="page-head-row">
          <div>
            <span className="eyebrow">Admin console</span>
            <h1 className="section-title">Platform overview</h1>
            <p className="section-description">
              Monitor user verification, agreements, escrow activity, and disputes from one place.
            </p>
          </div>
          <button type="button" className="btn-secondary" onClick={loadAll} disabled={loading}>
            <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
        {lastUpdated && (
          <p className="mt-2 text-xs font-semibold text-slate-400">
            Last updated {lastUpdated.toLocaleTimeString()}
          </p>
        )}

        {error && (
          <div className="banner-error">
            <p>{error}</p>
            <button type="button" className="btn-tiny" onClick={loadAll}>Retry</button>
          </div>
        )}

        <div className="kpi-grid mt-8">
          <Kpi icon={Users} label="Total users" value={summary?.users} />
          <Kpi icon={FileText} label="Active agreements" value={summary?.active_contracts} sub={`${summary?.contracts ?? 0} total`} />
          <Kpi
            icon={ShieldCheck}
            label="Pending verification"
            value={summary?.pending_verifications}
            warn={Boolean(summary?.pending_verifications)}
          />
          <Kpi icon={Gavel} label="Open disputes" value={summary?.open_disputes} warn={Boolean(summary?.open_disputes)} />
          <Kpi icon={Wallet} label="Payment records" value={summary?.payments} />
          <Kpi icon={Sprout} label="Crop updates" value={summary?.crop_updates} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <ChartCard title="Escrow volume — last 6 months" className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={volumeTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} width={56} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Area type="monotone" dataKey="total" stroke="#2457a6" fill="#dbeafe" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Verification rate">
            <div className="flex h-[260px] flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Verified", value: verificationRate ?? 0 },
                      { name: "Pending", value: 100 - (verificationRate ?? 0) },
                    ]}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={58}
                    outerRadius={78}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <Cell fill="#1e7d32" />
                    <Cell fill="#EEF2F0" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <p className="-mt-24 font-heading text-3xl font-extrabold text-navy">
                {verificationRate ?? "—"}%
              </p>
              <p className="mt-24 text-xs font-bold uppercase tracking-wide text-slate-400">
                of users verified
              </p>
            </div>
          </ChartCard>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <ChartCard title="Agreements by status">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#1e7d32" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="New agreements — last 6 months">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={agreementTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#1e7d32" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="User participation">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={roleData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={88} label>
                  {roleData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
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

          <div className="chart-card">
            <div className="flex items-center justify-between gap-3">
              <h2>Disputes needing attention</h2>
              <Link to="/admin/disputes" className="text-sm font-bold text-primary">Open dispute queue</Link>
            </div>
            <div className="mt-4 grid gap-3">
              {urgentDisputes.length === 0 && (
                <p className="text-sm text-slate-500">No unresolved disputes right now.</p>
              )}
              {urgentDisputes.map((dispute) => (
                <div key={dispute.id} className="flex items-center justify-between gap-3 rounded-2xl bg-soft p-4">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-navy">{dispute.title}</p>
                    <p className="text-xs text-slate-500">
                      {dispute.contract__crop__name || "Agreement"} · {dispute.contract__farmer__farm_name || "Farmer"} ↔ {dispute.contract__company__company_name || "Buyer"}
                    </p>
                  </div>
                  <span className={`badge-priority ${(dispute.priority || "medium").toLowerCase()}`}>
                    <AlertTriangle size={11} />
                    {formatStatus(dispute.priority)}
                  </span>
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

function priorityWeight(priority = "") {
  const value = priority.toUpperCase();
  if (value === "HIGH" || value === "URGENT") return 3;
  if (value === "MEDIUM") return 2;
  return 1;
}

// Groups records with a created_at timestamp into the trailing 6 calendar months.
// When valueKey is provided, sums that numeric field per month; otherwise counts records.
function buildMonthlyTrend(records, valueKey) {
  const now = new Date();
  const buckets = [];
  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: date.toLocaleDateString(undefined, { month: "short" }),
      total: 0,
      count: 0,
    });
  }
  const byKey = Object.fromEntries(buckets.map((bucket) => [bucket.key, bucket]));
  records.forEach((record) => {
    if (!record.created_at) return;
    const date = new Date(record.created_at);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const bucket = byKey[key];
    if (!bucket) return;
    bucket.count += 1;
    if (valueKey) bucket.total += Number(record[valueKey] || 0);
  });
  return buckets;
}

function Kpi({ icon: Icon, label, value, sub, warn }) {
  return (
    <div className={`kpi-card${warn ? " warn" : ""}`}>
      <div className="icon-box">
        <Icon size={20} />
      </div>
      <div>
        <p>{label}</p>
        <strong>{value ?? "—"}</strong>
        {sub && <p className="mt-1 text-xs font-semibold text-slate-400">{sub}</p>}
      </div>
    </div>
  );
}

function ChartCard({ title, children, className = "" }) {
  return (
    <div className={`chart-card ${className}`}>
      <h2>{title}</h2>
      <div className="chart-body" style={{ height: "auto" }}>{children}</div>
    </div>
  );
}