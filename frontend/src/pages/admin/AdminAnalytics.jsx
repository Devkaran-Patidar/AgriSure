import { useEffect, useMemo, useState } from "react";
import {
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
import { apiRequest } from "../../lib/api";
import { formatCurrency, formatStatus } from "../../lib/display";

const STATUS_COLORS = ["#1e7d32", "#69a879", "#f0b44d", "#b42318", "#2457a6", "#64748b"];
const DISPUTE_COLORS = { OPEN: "#b42318", UNDER_REVIEW: "#f0b44d", RESOLVED: "#1e7d32", REJECTED: "#64748b" };
const RANGE_OPTIONS = [
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
  { label: "All time", days: null },
];

export default function AdminAnalytics() {
  const [summary, setSummary] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState(RANGE_OPTIONS[1]);

  useEffect(() => {
    Promise.all([
      apiRequest("/admin/summary/"),
      apiRequest("/admin/contracts/"),
      apiRequest("/admin/payments/"),
      apiRequest("/admin/disputes/"),
    ])
      .then(([summaryData, contractData, paymentData, disputeData]) => {
        setSummary(summaryData);
        setContracts(contractData);
        setPayments(paymentData);
        setDisputes(disputeData);
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  const cutoff = range.days ? Date.now() - range.days * 24 * 60 * 60 * 1000 : null;
  const withinRange = (record) => !cutoff || new Date(record.created_at).getTime() >= cutoff;

  const scopedContracts = useMemo(() => contracts.filter(withinRange), [contracts, cutoff]);
  const scopedPayments = useMemo(() => payments.filter(withinRange), [payments, cutoff]);
  const scopedDisputes = useMemo(() => disputes.filter(withinRange), [disputes, cutoff]);

  const statusData = useMemo(
    () =>
      Object.entries(
        scopedContracts.reduce((result, contract) => {
          result[contract.status] = (result[contract.status] || 0) + 1;
          return result;
        }, {})
      ).map(([name, value]) => ({ name: formatStatus(name), value })),
    [scopedContracts]
  );

  const roleData = summary
    ? [{ name: "Farmers", value: summary.farmers }, { name: "Buyers", value: summary.companies }]
    : [];

  const paymentTypeData = useMemo(
    () =>
      Object.entries(
        scopedPayments.reduce((result, payment) => {
          const label = payment.transaction_type === "FUNDING" ? "Escrow funding" : "Milestone release";
          result[label] = (result[label] || 0) + Number(payment.amount || 0);
          return result;
        }, {})
      ).map(([name, amount]) => ({ name, amount })),
    [scopedPayments]
  );

  const disputeStatusData = useMemo(
    () =>
      Object.entries(
        scopedDisputes.reduce((result, dispute) => {
          result[dispute.status] = (result[dispute.status] || 0) + 1;
          return result;
        }, {})
      ).map(([name, value]) => ({ name: formatStatus(name), value, key: name })),
    [scopedDisputes]
  );

  const monthlyVolume = useMemo(() => buildMonthlyTrend(scopedPayments, "amount"), [scopedPayments]);

  const topFarmers = useMemo(() => rankByValue(scopedContracts, "farmer__farm_name"), [scopedContracts]);
  const topBuyers = useMemo(() => rankByValue(scopedContracts, "company__company_name"), [scopedContracts]);

  const totalVolume = scopedPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const avgDealSize = scopedContracts.length
    ? scopedContracts.reduce((sum, c) => sum + Number(c.agreed_price || 0), 0) / scopedContracts.length
    : 0;

  return (
    <div className="page-shell">
      <div className="container-page">
        <div className="page-head-row">
          <div>
            <span className="eyebrow">Admin analytics</span>
            <h1 className="section-title">Platform performance</h1>
            <p className="section-description">
              Track participation, agreement flow, and escrow activity from live platform records.
            </p>
          </div>
          <div className="segmented">
            {RANGE_OPTIONS.map((option) => (
              <button
                key={option.label}
                type="button"
                className={option.label === range.label ? "active" : ""}
                onClick={() => setRange(option)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="mt-5 text-sm font-bold text-red-600">{error}</p>}

        <div className="metric-grid mt-8">
          <Metric label="Total users" value={summary?.users ?? "—"} />
          <Metric label="Agreements in range" value={loading ? "—" : scopedContracts.length} />
          <Metric label="Escrow volume in range" value={loading ? "—" : formatCurrency(totalVolume)} />
          <Metric label="Avg. agreement value" value={loading ? "—" : formatCurrency(avgDealSize)} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <ChartCard title="Escrow volume trend">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyVolume}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} width={56} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Line type="monotone" dataKey="total" stroke="#2457a6" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Agreements by status">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#1e7d32" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Platform participation">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={roleData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {roleData.map((entry, index) => <Cell key={entry.name} fill={STATUS_COLORS[index]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Payment activity">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={paymentTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="amount" fill="#2457a6" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Disputes by status">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={disputeStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} label>
                  {disputeStatusData.map((entry) => (
                    <Cell key={entry.key} fill={DISPUTE_COLORS[entry.key] || "#64748b"} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <div className="chart-card">
            <h2>Top farmers &amp; buyers by agreement value</h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Farmers</p>
                <div className="mt-2">
                  {topFarmers.length === 0 && <p className="text-sm text-slate-500">No data yet.</p>}
                  {topFarmers.map((row, index) => (
                    <div className="leaderboard-row" key={row.name}>
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="leaderboard-rank">{index + 1}</span>
                        <span className="truncate text-sm font-bold text-navy">{row.name}</span>
                      </div>
                      <span className="text-sm font-bold text-slate-600">{formatCurrency(row.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Buyers</p>
                <div className="mt-2">
                  {topBuyers.length === 0 && <p className="text-sm text-slate-500">No data yet.</p>}
                  {topBuyers.map((row, index) => (
                    <div className="leaderboard-row" key={row.name}>
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="leaderboard-rank">{index + 1}</span>
                        <span className="truncate text-sm font-bold text-navy">{row.name}</span>
                      </div>
                      <span className="text-sm font-bold text-slate-600">{formatCurrency(row.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function rankByValue(contracts, key, limit = 5) {
  const totals = contracts.reduce((result, contract) => {
    const name = contract[key];
    if (!name) return result;
    result[name] = (result[name] || 0) + Number(contract.agreed_price || 0);
    return result;
  }, {});
  return Object.entries(totals)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

function buildMonthlyTrend(records, valueKey) {
  const now = new Date();
  const buckets = [];
  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ key: `${date.getFullYear()}-${date.getMonth()}`, label: date.toLocaleDateString(undefined, { month: "short" }), total: 0 });
  }
  const byKey = Object.fromEntries(buckets.map((bucket) => [bucket.key, bucket]));
  records.forEach((record) => {
    if (!record.created_at) return;
    const date = new Date(record.created_at);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const bucket = byKey[key];
    if (!bucket) return;
    bucket.total += Number(record[valueKey] || 0);
  });
  return buckets;
}

function Metric({ label, value }) {
  return (
    <div className="metric-card">
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