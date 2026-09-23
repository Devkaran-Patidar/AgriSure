import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../lib/api";
import StatusBadge from "../../components/common/StatusBadge";
import {
  formatCurrency,
  formatPaymentTitle,
  formatStatus,
} from "../../lib/display";

export default function FarmerPayments() {
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPayments = async () => {
      try {
        setLoading(true);

        const data = await apiRequest("/payments/accounts/");
        setAccounts(data);
      } catch (requestError) {
        setError(requestError.message || "Unable to load payment details.");
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, []);

  const getMilestoneStats = (milestones = []) => {
    const total = milestones.length;

    const completed = milestones.filter((milestone) => {
      const status = String(milestone.status || "").toLowerCase();

      return (
        status === "released" ||
        status === "completed" ||
        status === "paid" ||
        status === "success"
      );
    }).length;

    const pending = total - completed;

    return {
      total,
      completed,
      pending,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  };

  const getStatusStyle = (status) => {
    const value = String(status || "").toLowerCase();

    if (
      value === "released" ||
      value === "completed" ||
      value === "paid" ||
      value === "success"
    ) {
      return {
        dot: "bg-emerald-500",
        line: "bg-emerald-200",
      };
    }

    if (
      value === "pending" ||
      value === "processing" ||
      value === "created"
    ) {
      return {
        dot: "bg-amber-500",
        line: "bg-slate-200",
      };
    }

    if (
      value === "failed" ||
      value === "cancelled" ||
      value === "rejected"
    ) {
      return {
        dot: "bg-red-500",
        line: "bg-red-100",
      };
    }

    return {
      dot: "bg-slate-400",
      line: "bg-slate-200",
    };
  };

  const overallStats = useMemo(() => {
    let totalValue = 0;
    let releasedValue = 0;
    let pendingValue = 0;

    accounts.forEach((account) => {
      const milestones = account.milestones || [];

      milestones.forEach((milestone) => {
        const amount = Number(milestone.amount) || 0;

        totalValue += amount;

        const status = String(milestone.status || "").toLowerCase();

        if (
          status === "released" ||
          status === "completed" ||
          status === "paid" ||
          status === "success"
        ) {
          releasedValue += amount;
        } else {
          pendingValue += amount;
        }
      });
    });

    return {
      totalValue,
      releasedValue,
      pendingValue,
    };
  }, [accounts]);

  return (
    <div className="page-shell">
      <div className="container-page">

        {/* HEADER */}
        <div className="max-w-3xl">
          <span className="eyebrow">Payments</span>

          <h1 className="section-title mt-2">
            Your payouts & escrow
          </h1>

          <p className="section-description mt-3">
            Track your contract payments, released amounts, pending
            milestones, and escrow balances from one place.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-5 py-4">
            <p className="text-sm font-semibold text-red-600">
              {error}
            </p>
          </div>
        )}

        {/* SUMMARY */}
        {!loading && !error && accounts.length > 0 && (
          <div className="mt-8 grid gap-4 sm:grid-cols-3">

            {/* Total */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Total payment
                </p>

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  ₹
                </div>
              </div>

              <p className="mt-3 text-2xl font-extrabold text-navy">
                {formatCurrency(overallStats.totalValue)}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Across all milestones
              </p>
            </div>

            {/* Released */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Released
                </p>

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  ✓
                </div>
              </div>

              <p className="mt-3 text-2xl font-extrabold text-emerald-600">
                {formatCurrency(overallStats.releasedValue)}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Payments already released
              </p>
            </div>

            {/* Pending */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Pending
                </p>

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  ⏳
                </div>
              </div>

              <p className="mt-3 text-2xl font-extrabold text-amber-600">
                {formatCurrency(overallStats.pendingValue)}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Awaiting milestone release
              </p>
            </div>

          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="mt-8 grid gap-5 md:grid-cols-2">

            {[1, 2].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="h-4 w-24 rounded bg-slate-200" />
                <div className="mt-3 h-6 w-48 rounded bg-slate-200" />
                <div className="mt-2 h-4 w-32 rounded bg-slate-200" />

                <div className="mt-6 h-20 rounded-xl bg-slate-100" />
                <div className="mt-3 h-20 rounded-xl bg-slate-100" />
              </div>
            ))}

          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && accounts.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
              💳
            </div>

            <h2 className="mt-4 font-heading text-xl font-extrabold text-navy">
              No payment records yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Once an agreement is connected to an escrow account,
              your payment milestones will appear here.
            </p>

          </div>
        )}

        {/* PAYMENT ACCOUNTS */}
        {!loading && accounts.length > 0 && (
          <div className="mt-8 grid gap-6 lg:grid-cols-2">

            {accounts.map((account) => {
              const milestones = account.milestones || [];
              const stats = getMilestoneStats(milestones);

              return (
                <article
                  key={account.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >

                  {/* CARD HEADER */}
                  <div className="border-b border-slate-100 p-5">

                    <div className="flex items-start justify-between gap-4">

                      <div className="min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                          Agreement
                        </p>

                        <h2 className="mt-1 truncate font-heading text-xl font-extrabold text-navy">
                          {formatPaymentTitle(account)}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          Buyer:{" "}
                          <span className="font-semibold text-slate-700">
                            {account.company_name || "—"}
                          </span>
                        </p>
                      </div>

                      <div className="shrink-0">
                        <StatusBadge status={account.status} />
                      </div>

                    </div>

                    {/* AMOUNT */}
                    <div className="mt-5 flex items-end justify-between gap-4">

                      <div>
                        <p className="text-xs font-semibold text-slate-400">
                          Escrow balance
                        </p>

                        <p className="mt-1 text-2xl font-extrabold text-navy">
                          {formatCurrency(account.total_amount)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-semibold text-slate-400">
                          Milestones
                        </p>

                        <p className="mt-1 text-sm font-bold text-slate-700">
                          {stats.completed}/{stats.total} released
                        </p>
                      </div>

                    </div>

                    {/* PROGRESS */}
                    <div className="mt-4">

                      <div className="mb-2 flex justify-between text-xs">
                        <span className="font-semibold text-slate-500">
                          Payment progress
                        </span>

                        <span className="font-bold text-primary">
                          {stats.percentage}%
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{
                            width: `${stats.percentage}%`,
                          }}
                        />
                      </div>

                    </div>

                  </div>

                  {/* MILESTONES */}
                  <div className="p-5">

                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-heading text-base font-extrabold text-navy">
                        Payment milestones
                      </h3>

                      <span className="text-xs font-semibold text-slate-400">
                        {stats.pending} pending
                      </span>
                    </div>

                    {milestones.length === 0 ? (
                      <div className="rounded-xl bg-soft p-4 text-center">
                        <p className="text-sm text-slate-500">
                          No milestones available.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-0">

                        {milestones.map((milestone, index) => {
                          const statusStyle = getStatusStyle(
                            milestone.status
                          );

                          const isLast =
                            index === milestones.length - 1;

                          return (
                            <div
                              key={milestone.id}
                              className="relative flex gap-3"
                            >

                              {/* TIMELINE */}
                              <div className="flex w-5 shrink-0 flex-col items-center">

                                <span
                                  className={`mt-1.5 h-3 w-3 rounded-full ring-4 ring-white ${statusStyle.dot}`}
                                />

                                {!isLast && (
                                  <span
                                    className={`mt-1 w-0.5 flex-1 ${statusStyle.line}`}
                                  />
                                )}

                              </div>

                              {/* MILESTONE */}
                              <div
                                className={`mb-3 min-w-0 flex-1 rounded-xl p-4 ${
                                  String(
                                    milestone.status || ""
                                  ).toLowerCase() === "pending"
                                    ? "bg-amber-50/60"
                                    : "bg-soft"
                                }`}
                              >

                                <div className="flex items-start justify-between gap-3">

                                  <div className="min-w-0">
                                    <p className="font-bold text-navy">
                                      {milestone.name}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                      {formatStatus(
                                        milestone.status
                                      )}
                                    </p>
                                  </div>

                                  <p className="shrink-0 font-extrabold text-navy">
                                    {formatCurrency(
                                      milestone.amount
                                    )}
                                  </p>

                                </div>

                              </div>

                            </div>
                          );
                        })}

                      </div>
                    )}

                  </div>

                </article>
              );
            })}

          </div>
        )}

      </div>
    </div>
  );
}