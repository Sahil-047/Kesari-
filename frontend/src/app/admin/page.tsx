"use client";

import { useAuth } from "@/components/admin/AuthProvider";
import Icon from "@/components/admin/Icon";
import { IsoCube } from "@/components/admin/Iso";
import RevenueChart from "@/components/admin/RevenueChart";
import { api } from "@/lib/api/client";
import type { SalesRange, SalesReport } from "@/lib/api/types";
import {
  inr,
  ORDER_CHIP,
  ORDER_STATUS_LABEL,
  PAYMENT_CHIP,
  PAYMENT_LABEL,
  shortDate,
  SOURCE_LABEL,
} from "@/lib/admin/format";
import Link from "next/link";
import { useEffect, useState } from "react";

const RANGES: { value: SalesRange; label: string }[] = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "12m", label: "12 months" },
];

function Change({ value }: { value: number | null }) {
  if (value === null) return <span className="cms-mono text-[11px] text-[var(--cms-muted)]">new</span>;
  const up = value >= 0;
  return (
    <span className={`cms-mono text-[11px] font-semibold ${up ? "text-[var(--cms-success)]" : "text-[var(--cms-danger)]"}`}>
      {up ? "▲" : "▼"} {Math.abs(value)}%
    </span>
  );
}

function Kpi({
  label,
  value,
  note,
  tone = "default",
}: {
  label: string;
  value: string;
  note?: React.ReactNode;
  tone?: "default" | "accent";
}) {
  return (
    <div className={`cms-card p-5 ${tone === "accent" ? "bg-[var(--cms-accent-soft)]" : ""}`}>
      <p className="cms-eyebrow">{label}</p>
      <p className="cms-display mt-2 text-[28px] leading-none tabular-nums">{value}</p>
      <div className="mt-2 min-h-4 text-[12px] text-[var(--cms-muted)]">{note}</div>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export default function SalesDashboardPage() {
  const { user } = useAuth();
  const [range, setRange] = useState<SalesRange>("30d");
  const [report, setReport] = useState<SalesReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get<SalesReport>("/admin/analytics/sales", { range })
      .then((r) => !cancelled && setReport(r))
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : "Could not load sales"));
    return () => {
      cancelled = true;
    };
  }, [range]);

  const s = report?.summary;
  const rangeLabel = RANGES.find((r) => r.value === range)!.label.toLowerCase();
  const topMax = Math.max(1, ...(report?.topProducts.map((p) => p.revenue) ?? [1]));
  const empty = report && report.summary.orders === 0 && report.recentOrders.length === 0;

  return (
    <div className="mx-auto max-w-[1240px] px-8 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="cms-eyebrow">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="cms-display mt-1 text-[30px] leading-tight">
            {greeting()}, {user?.name.split(" ")[0]}
          </h1>
          <p className="text-[var(--cms-muted)]">Sales and money at the house, last {rangeLabel}.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-[4px] border border-[var(--cms-line)] bg-[var(--cms-surface)] p-0.5 shadow-[3px_3px_0_0_var(--cms-line)]" role="group" aria-label="Date range">
            {RANGES.map((r) => (
              <button
                key={r.value}
                type="button"
                aria-pressed={range === r.value}
                onClick={() => setRange(r.value)}
                className={`cms-mono h-8 rounded-[3px] px-3 text-[11px] uppercase tracking-[0.06em] transition-colors ${
                  range === r.value ? "bg-[var(--cms-ink)] text-white" : "text-[var(--cms-ink-2)] hover:bg-[var(--cms-sunken)]"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <Link href="/admin/orders?new=1" className="cms-btn cms-btn-primary">
            <Icon name="plus" size={16} /> Record a sale
          </Link>
        </div>
      </div>

      {error && (
        <p className="mt-6 rounded-[4px] border border-[var(--cms-danger)] bg-[var(--cms-danger-soft)] px-4 py-3 font-semibold text-[var(--cms-danger)]">
          {error}
        </p>
      )}

      {/* KPIs */}
      <div className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <Kpi tone="accent" label="Revenue" value={s ? inr(s.revenue, { compact: true }) : "—"} note={s && <><Change value={s.revenueChange} /> vs previous</>} />
        <Kpi label="Collected" value={s ? inr(s.collected, { compact: true }) : "—"} note="Money received" />
        <Kpi
          label="To collect"
          value={report ? inr(report.outstanding.amount, { compact: true }) : "—"}
          note={report && `${report.outstanding.orders} open order${report.outstanding.orders === 1 ? "" : "s"}`}
        />
        <Kpi label="Orders" value={s ? String(s.orders) : "—"} note={s && <><Change value={s.ordersChange} /> vs previous</>} />
        <Kpi label="Average order" value={s ? inr(s.averageOrder, { compact: true }) : "—"} />
        <Kpi label="Pieces sold" value={s ? String(s.units) : "—"} />
      </div>

      {empty ? (
        <div className="cms-card mt-8 flex flex-col items-center gap-4 px-6 py-14 text-center">
          <div className="flex items-end gap-1">
            <IsoCube size={44} />
            <IsoCube size={60} top="#f0a15f" left="var(--cms-accent)" right="var(--cms-accent-side)" />
            <IsoCube size={36} />
          </div>
          <p className="cms-display text-[22px]">No sales recorded yet</p>
          <p className="max-w-md text-[var(--cms-muted)]">
            Orders from the website bag and WhatsApp land here automatically. Sales made in the store or on the phone can be recorded by hand.
          </p>
          <Link href="/admin/orders?new=1" className="cms-btn cms-btn-primary">
            <Icon name="plus" size={16} /> Record the first sale
          </Link>
        </div>
      ) : (
        <>
          {/* Revenue over time */}
          <section className="cms-card mt-6 p-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="cms-eyebrow">Revenue · {range === "12m" ? "by month" : "by day"}</p>
                <p className="cms-display mt-1 text-[20px]">{s ? inr(s.revenue) : "—"}</p>
              </div>
              <p className="cms-help">Cancelled orders are not counted</p>
            </div>
            <div className="mt-4">{report ? <RevenueChart data={report.series} /> : <div className="h-[220px]" />}</div>
          </section>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
            {/* Top products */}
            <section className="cms-card p-6">
              <p className="cms-eyebrow">Best sellers</p>
              <h2 className="cms-display mt-1 text-[18px]">Top pieces by revenue</h2>
              <ul className="mt-5 space-y-4">
                {report?.topProducts.length === 0 && <li className="text-[var(--cms-muted)]">No pieces sold in this period.</li>}
                {report?.topProducts.map((p, i) => (
                  <li key={p.name} className="flex items-center gap-3">
                    <span className="cms-mono w-5 text-[11px] text-[var(--cms-muted)]">{String(i + 1).padStart(2, "0")}</span>
                    <span className="h-11 w-9 shrink-0 overflow-hidden rounded-[3px] border border-[var(--cms-border)] bg-[var(--cms-sunken)]">
                      {p.image && (
                        // eslint-disable-next-line @next/next/no-img-element -- S3 or /public URLs
                        <img src={p.image} alt="" className="h-full w-full object-cover" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="truncate font-semibold">{p.name}</span>
                        <span className="cms-mono shrink-0 text-[12px] font-semibold">{inr(p.revenue)}</span>
                      </span>
                      <span className="mt-1.5 flex items-center gap-3">
                        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--cms-sunken)]">
                          <span className="block h-full rounded-full bg-[var(--cms-accent)]" style={{ width: `${(p.revenue / topMax) * 100}%` }} />
                        </span>
                        <span className="cms-mono w-14 shrink-0 text-right text-[11px] text-[var(--cms-muted)]">{p.units} sold</span>
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Status and channels */}
            <section className="cms-card p-6">
              <p className="cms-eyebrow">Pipeline</p>
              <h2 className="cms-display mt-1 text-[18px]">Orders by stage</h2>
              <ul className="mt-4 divide-y divide-[var(--cms-border)]">
                {(report?.byStatus ?? []).map((row) => (
                  <li key={row.status} className="flex items-center justify-between py-2.5">
                    <span className={`cms-chip ${ORDER_CHIP[row.status] ?? ""}`}>{ORDER_STATUS_LABEL[row.status]}</span>
                    <span className="cms-mono font-semibold">{row.count}</span>
                  </li>
                ))}
                {report?.byStatus.length === 0 && <li className="py-2.5 text-[var(--cms-muted)]">No orders in this period.</li>}
              </ul>

              <h2 className="cms-display mt-6 text-[18px]">Where orders come from</h2>
              <ul className="mt-3 divide-y divide-[var(--cms-border)]">
                {(report?.bySource ?? []).map((row) => (
                  <li key={row.source} className="flex items-center justify-between gap-3 py-2.5">
                    <span className="flex items-center gap-2 font-semibold">
                      {row.source === "whatsapp" && <Icon name="whatsapp" size={16} />}
                      {SOURCE_LABEL[row.source]}
                    </span>
                    <span className="cms-mono text-[12px] text-[var(--cms-muted)]">
                      {row.count} · {inr(row.revenue, { compact: true })}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Recent orders */}
          <section className="cms-card mt-6 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="cms-eyebrow">Latest</p>
                <h2 className="cms-display mt-1 text-[18px]">Recent orders</h2>
              </div>
              <Link href="/admin/orders" className="cms-btn cms-btn-sm">
                All orders
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="cms-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Stage</th>
                    <th>Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {report?.recentOrders.map((o) => (
                    <tr key={o.id}>
                      <td className="cms-mono font-semibold text-[var(--cms-ink)]">{o.orderNumber}</td>
                      <td>{o.customer.name}</td>
                      <td>{shortDate(o.placedAt)}</td>
                      <td className="cms-mono">{inr(o.totalInr)}</td>
                      <td>
                        <span className={`cms-chip ${ORDER_CHIP[o.status] ?? ""}`}>{ORDER_STATUS_LABEL[o.status]}</span>
                      </td>
                      <td>
                        <span className={`cms-chip ${PAYMENT_CHIP[o.paymentStatus] ?? ""}`}>{PAYMENT_LABEL[o.paymentStatus]}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
