"use client";

import Icon from "@/components/admin/Icon";
import OrderForm from "@/components/admin/OrderForm";
import ScreenHeader from "@/components/admin/ScreenHeader";
import { api, type PageMeta } from "@/lib/api/client";
import type { ApiOrder } from "@/lib/api/types";
import {
  inr,
  ORDER_CHIP,
  ORDER_STATUS_LABEL,
  PAYMENT_CHIP,
  PAYMENT_LABEL,
  shortDate,
  SOURCE_LABEL,
} from "@/lib/admin/format";
import { useCallback, useEffect, useState } from "react";

const FILTERS = [
  { name: "status", label: "All stages", options: ORDER_STATUS_LABEL },
  { name: "paymentStatus", label: "All payments", options: PAYMENT_LABEL },
  { name: "source", label: "All channels", options: SOURCE_LABEL },
] as const;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<ApiOrder | "new" | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await api.list<ApiOrder>("/admin/orders", { page, limit: 20, search, ...filters });
      setOrders(r.items);
      setMeta(r.meta);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load orders");
    } finally {
      setLoading(false);
    }
  }, [page, search, filters]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  // The dashboard's "Record a sale" links here with ?new=1.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (new URLSearchParams(window.location.search).get("new") === "1") setEditing("new");
  }, []);

  return (
    <div>
      <ScreenHeader
        title="Orders"
        description={meta ? `${meta.total} order${meta.total === 1 ? "" : "s"} from the website, WhatsApp and the store` : undefined}
        actions={
          <button type="button" className="cms-btn cms-btn-primary" onClick={() => setEditing("new")}>
            <Icon name="plus" size={16} /> Record a sale
          </button>
        }
      />

      <div className="mx-auto max-w-[1240px] px-8 py-6">
        <div className="mb-4 flex flex-wrap gap-2">
          <input
            className="cms-input max-w-xs"
            placeholder="Search order no., name, phone…"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
          {FILTERS.map((f) => (
            <select
              key={f.name}
              className="cms-select w-auto min-w-[160px]"
              value={filters[f.name] ?? ""}
              onChange={(e) => {
                setPage(1);
                setFilters((p) => ({ ...p, [f.name]: e.target.value }));
              }}
            >
              <option value="">{f.label}</option>
              {Object.entries(f.options).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          ))}
        </div>

        {error && (
          <p className="mb-4 rounded-[4px] border border-[var(--cms-danger)] bg-[var(--cms-danger-soft)] px-4 py-3 font-semibold text-[var(--cms-danger)]">
            {error}
          </p>
        )}

        <div className="cms-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="cms-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Pieces</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Stage</th>
                  <th>Payment</th>
                  <th>Channel</th>
                </tr>
              </thead>
              <tbody>
                {loading && orders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-[var(--cms-muted)]">
                      Loading…
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-14 text-center">
                      <p className="cms-display text-[18px] text-[var(--cms-ink)]">No orders here yet</p>
                      <button type="button" onClick={() => setEditing("new")} className="cms-btn cms-btn-primary mt-4">
                        <Icon name="plus" size={16} /> Record a sale
                      </button>
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o.id} className="cursor-pointer" onClick={() => setEditing(o)}>
                      <td className="cms-mono font-semibold text-[var(--cms-ink)]">{o.orderNumber}</td>
                      <td>{shortDate(o.placedAt)}</td>
                      <td>
                        <span className="block font-semibold text-[var(--cms-ink)]">{o.customer.name}</span>
                        <span className="cms-mono text-[11px] text-[var(--cms-muted)]">{o.customer.phone}</span>
                      </td>
                      <td className="cms-mono">{o.items.reduce((n, i) => n + i.quantity, 0)}</td>
                      <td className="cms-mono font-semibold text-[var(--cms-ink)]">{inr(o.totalInr)}</td>
                      <td className="cms-mono">{inr(o.amountPaidInr)}</td>
                      <td>
                        <span className={`cms-chip ${ORDER_CHIP[o.status] ?? ""}`}>{ORDER_STATUS_LABEL[o.status]}</span>
                      </td>
                      <td>
                        <span className={`cms-chip ${PAYMENT_CHIP[o.paymentStatus] ?? ""}`}>{PAYMENT_LABEL[o.paymentStatus]}</span>
                      </td>
                      <td className="text-[12.5px]">{SOURCE_LABEL[o.source]}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {meta && meta.pages > 1 && (
          <div className="mt-4 flex items-center justify-end gap-2">
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="cms-btn cms-btn-sm">
              Previous
            </button>
            <span className="cms-help px-2">
              Page {meta.page} of {meta.pages}
            </span>
            <button type="button" disabled={page >= meta.pages} onClick={() => setPage((p) => p + 1)} className="cms-btn cms-btn-sm">
              Next
            </button>
          </div>
        )}
      </div>

      {editing && (
        <OrderForm
          order={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}
