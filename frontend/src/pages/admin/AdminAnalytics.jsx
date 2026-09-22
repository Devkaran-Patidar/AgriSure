import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { apiRequest } from "../../lib/api";
import { formatCurrency, formatStatus } from "../../lib/display";

const COLORS = ["#1e7d32", "#69a879", "#f0b44d", "#b42318", "#2457a6", "#64748b"];

export default function AdminAnalytics() {
  const [summary, setSummary] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      apiRequest("/admin/summary/"),
      apiRequest("/admin/contracts/"),
      apiRequest("/admin/payments/"),
    ])
      .then(([summaryData, contractData, paymentData]) => {
        setSummary(summaryData);
        setContracts(contractData);
        setPayments(paymentData);
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
    ? [{ name: "Farmers", value: summary.farmers }, { name: "Buyers", value: summary.companies }]
    : [];

  const paymentData = Object.entries(
    payments.reduce((result, payment) => {
      const label = payment.transaction_type === "FUNDING" ? "Escrow funding" : "Milestone release";
      result[label] = (result[label] || 0) + Number(payment.amount || 0);
      return result;
    }, {})
  ).map(([name, amount]) => ({ name, amount }));

  return (
    <div className="page-shell">
      <div className="container-page">
        <span className="eyebrow">Admin analytics</span>
        <h1 className="section-title">Platform performance</h1>
        <p className="section-description">Track participation, agreement flow, and escrow activity from live platform records.</p>
        {error && <p className="mt-5 text-sm font-bold text-red-600">{error}</p>}

        <div className="metric-grid mt-8">
          <Metric label="Total users" value={summary?.users ?? "—"} />
          <Metric label="Agreements" value={summary?.contracts ?? "—"} />
          <Metric label="Active agreements" value={summary?.active_contracts ?? "—"} />
          <Metric label="Pending verification" value={summary?.pending_verifications ?? "—"} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
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
                  {roleData.map((entry, index) => <Cell key={entry.name} fill={COLORS[index]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Payment activity">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={paymentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="amount" fill="#2457a6" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </div>
  );
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
