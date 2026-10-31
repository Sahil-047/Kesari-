"use client";

import { api, ApiRequestError } from "@/lib/api/client";
import type { ApiOrder, ApiOrderItem, ApiProduct } from "@/lib/api/types";
import { inr, ORDER_STATUS_LABEL, PAYMENT_LABEL, SOURCE_LABEL } from "@/lib/admin/format";
import { useEffect, useState, type FormEvent } from "react";
import Icon from "./Icon";

type ProductOption = ApiProduct & { images?: { url: string }[] };

type Draft = Omit<ApiOrder, "id" | "orderNumber" | "subtotalInr" | "totalInr" | "placedAt" | "paymentStatus"> & {
  placedAt: string;
  paymentStatus: ApiOrder["paymentStatus"] | "";
};

const emptyLine = (): ApiOrderItem => ({ name: "", priceInr: 0, quantity: 1 });

function toDraft(order: ApiOrder | null): Draft {
  if (!order) {
    return {
      source: "manual",
      customer: { name: "", phone: "", email: "", city: "", address: "" },
      items: [emptyLine()],
      discountInr: 0,
      amountPaidInr: 0,
      status: "confirmed",
      paymentStatus: "",
      paymentMethod: "",
      note: "",
      internalNote: "",
      placedAt: new Date().toISOString().slice(0, 10),
    };
  }
  return { ...order, paymentStatus: "", placedAt: order.placedAt.slice(0, 10) };
}

/** wa.me link from a phone number; Indian 10-digit numbers get +91. */
export function whatsappLink(phone: string, text = ""): string | null {
  let digits = phone.replace(/\D/g, "");
  if (digits.length === 10) digits = `91${digits}`;
  if (digits.length < 10) return null;
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export default function OrderForm({
  order,
  onClose,
  onSaved,
}: {
  order: ApiOrder | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState<Draft>(() => toDraft(order));
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .list<ProductOption>("/admin/products", { limit: 100 })
      .then((r) => setProducts(r.items))
      .catch(() => setProducts([]));
  }, []);

  const subtotal = draft.items.reduce((sum, i) => sum + (i.priceInr || 0) * (i.quantity || 0), 0);
  const total = Math.max(0, subtotal - (draft.discountInr || 0));
  const balance = Math.max(0, total - (draft.amountPaidInr || 0));

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));
  const setCustomer = (key: keyof Draft["customer"], value: string) =>
    setDraft((d) => ({ ...d, customer: { ...d.customer, [key]: value } }));
  const setLine = (i: number, patch: Partial<ApiOrderItem>) =>
    setDraft((d) => ({ ...d, items: d.items.map((it, j) => (j === i ? { ...it, ...patch } : it)) }));

  const pickProduct = (i: number, id: string) => {
    const p = products.find((x) => x.id === id);
    if (!p) return setLine(i, { product: undefined, slug: undefined });
    setLine(i, { product: p.id, slug: p.slug, name: p.name, priceInr: p.priceInr, image: p.images?.[0]?.url });
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      source: draft.source,
      customer: Object.fromEntries(Object.entries(draft.customer).filter(([, v]) => v)),
      items: draft.items
        .filter((i) => i.name.trim())
        .map(({ product, slug, name, image, priceInr, quantity }) => ({
          ...(product && { product }),
          ...(slug && { slug }),
          ...(image && { image }),
          name,
          priceInr: Math.round(priceInr || 0),
          quantity: quantity || 1,
        })),
      discountInr: Math.round(draft.discountInr || 0),
      amountPaidInr: Math.round(draft.amountPaidInr || 0),
      status: draft.status,
      ...(draft.paymentStatus && { paymentStatus: draft.paymentStatus }),
      ...(draft.paymentMethod && { paymentMethod: draft.paymentMethod }),
      ...(draft.note && { note: draft.note }),
      ...(draft.internalNote && { internalNote: draft.internalNote }),
      placedAt: draft.placedAt,
    };
    try {
      if (order) await api.patch(`/admin/orders/${order.id}`, payload);
      else await api.post("/admin/orders", payload);
      onSaved();
    } catch (err) {
      setError(
        err instanceof ApiRequestError && err.details?.length
          ? err.details.map((d) => d.message).join(" · ")
          : err instanceof Error
            ? err.message
            : "Could not save",
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!order || !window.confirm(`Delete order ${order.orderNumber}? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/orders/${order.id}`);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete");
    }
  };

  const wa = whatsappLink(
    draft.customer.phone,
    order ? `Hello ${draft.customer.name}, this is Kesari about your order ${order.orderNumber}.` : "",
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[rgba(31,28,25,0.35)]" onClick={onClose}>
      <form
        onSubmit={save}
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-[760px] flex-col border-l border-[var(--cms-line)] bg-[var(--cms-canvas)]"
      >
        <div className="flex items-center justify-between border-b border-[var(--cms-line)] bg-[var(--cms-surface)] px-6 py-4">
          <div>
            <p className="cms-eyebrow">{order ? "Order" : "New sale"}</p>
            <h2 className="cms-display text-[22px]">{order ? order.orderNumber : "Record a sale"}</h2>
          </div>
          <div className="flex items-center gap-2">
            {wa && (
              <a href={wa} target="_blank" rel="noreferrer" className="cms-btn cms-btn-sm">
                <Icon name="whatsapp" size={15} /> WhatsApp
              </a>
            )}
            <button type="button" onClick={onClose} className="cms-btn cms-btn-ghost">
              Close
            </button>
          </div>
        </div>

        <div className="cms-scroll flex-1 space-y-5 overflow-y-auto p-6">
          {/* Customer */}
          <section className="cms-card p-5">
            <p className="cms-eyebrow">Customer</p>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <label className="space-y-1.5">
                <span className="cms-label">Name *</span>
                <input className="cms-input" required value={draft.customer.name} onChange={(e) => setCustomer("name", e.target.value)} />
              </label>
              <label className="space-y-1.5">
                <span className="cms-label">Phone / WhatsApp *</span>
                <input className="cms-input" required placeholder="+91 98765 43210" value={draft.customer.phone} onChange={(e) => setCustomer("phone", e.target.value)} />
              </label>
              <label className="space-y-1.5">
                <span className="cms-label">Email</span>
                <input className="cms-input" type="email" value={draft.customer.email ?? ""} onChange={(e) => setCustomer("email", e.target.value)} />
              </label>
              <label className="space-y-1.5">
                <span className="cms-label">City</span>
                <input className="cms-input" value={draft.customer.city ?? ""} onChange={(e) => setCustomer("city", e.target.value)} />
              </label>
              <label className="space-y-1.5 md:col-span-2">
                <span className="cms-label">Delivery address</span>
                <textarea className="cms-textarea min-h-[64px]" rows={2} value={draft.customer.address ?? ""} onChange={(e) => setCustomer("address", e.target.value)} />
              </label>
            </div>
          </section>

          {/* Items */}
          <section className="cms-card p-5">
            <p className="cms-eyebrow">Pieces</p>
            <div className="mt-3 space-y-3">
              {draft.items.map((item, i) => (
                <div key={i} className="cms-card-quiet grid gap-3 p-3 md:grid-cols-[1fr_120px_80px_auto]">
                  <div className="space-y-2">
                    <select className="cms-select" value={item.product ?? ""} onChange={(e) => pickProduct(i, e.target.value)}>
                      <option value="">Custom item (type below)</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} · {inr(p.priceInr)}
                        </option>
                      ))}
                    </select>
                    <input className="cms-input" placeholder="Item name" value={item.name} onChange={(e) => setLine(i, { name: e.target.value })} />
                  </div>
                  <label className="space-y-1">
                    <span className="cms-help">Price ₹</span>
                    <input className="cms-input cms-mono" type="number" min={0} value={item.priceInr} onChange={(e) => setLine(i, { priceInr: Number(e.target.value) })} />
                  </label>
                  <label className="space-y-1">
                    <span className="cms-help">Qty</span>
                    <input className="cms-input cms-mono" type="number" min={1} value={item.quantity} onChange={(e) => setLine(i, { quantity: Number(e.target.value) })} />
                  </label>
                  <div className="flex items-end justify-between gap-2 md:flex-col md:items-end">
                    <span className="cms-mono pt-6 text-[13px] font-semibold">{inr((item.priceInr || 0) * (item.quantity || 0))}</span>
                    <button
                      type="button"
                      aria-label="Remove item"
                      disabled={draft.items.length === 1}
                      onClick={() => set("items", draft.items.filter((_, j) => j !== i))}
                      className="cms-btn cms-btn-danger cms-btn-sm px-2"
                    >
                      <Icon name="trash" size={15} />
                    </button>
                  </div>
                </div>
              ))}
              <button type="button" className="cms-btn w-full border-dashed" onClick={() => set("items", [...draft.items, emptyLine()])}>
                <Icon name="plus" size={16} /> Add a piece
              </button>
            </div>

            {/* Totals */}
            <dl className="cms-mono ml-auto mt-5 max-w-[320px] space-y-2 text-[13px]">
              <div className="flex justify-between">
                <dt className="text-[var(--cms-muted)]">Subtotal</dt>
                <dd>{inr(subtotal)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[var(--cms-muted)]">Discount ₹</dt>
                <dd>
                  <input className="cms-input cms-mono h-8 w-28 text-right" type="number" min={0} value={draft.discountInr} onChange={(e) => set("discountInr", Number(e.target.value))} />
                </dd>
              </div>
              <div className="flex justify-between border-t border-[var(--cms-line)] pt-2 text-[15px] font-semibold">
                <dt>Total</dt>
                <dd>{inr(total)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[var(--cms-muted)]">Paid so far ₹</dt>
                <dd>
                  <input className="cms-input cms-mono h-8 w-28 text-right" type="number" min={0} value={draft.amountPaidInr} onChange={(e) => set("amountPaidInr", Number(e.target.value))} />
                </dd>
              </div>
              <div className={`flex justify-between font-semibold ${balance > 0 ? "text-[var(--cms-accent-ink)]" : "text-[var(--cms-success)]"}`}>
                <dt>{balance > 0 ? "Balance to collect" : "Fully paid"}</dt>
                <dd>{inr(balance)}</dd>
              </div>
            </dl>
          </section>

          {/* Status */}
          <section className="cms-card grid gap-4 p-5 md:grid-cols-3">
            <label className="space-y-1.5">
              <span className="cms-label">Stage</span>
              <select className="cms-select" value={draft.status} onChange={(e) => set("status", e.target.value as Draft["status"])}>
                {Object.entries(ORDER_STATUS_LABEL).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1.5">
              <span className="cms-label">Payment status</span>
              <select className="cms-select" value={draft.paymentStatus} onChange={(e) => set("paymentStatus", e.target.value as Draft["paymentStatus"])}>
                <option value="">Automatic (from amounts)</option>
                {Object.entries(PAYMENT_LABEL).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1.5">
              <span className="cms-label">Paid by</span>
              <select className="cms-select" value={draft.paymentMethod ?? ""} onChange={(e) => set("paymentMethod", e.target.value)}>
                <option value="">—</option>
                <option value="upi">UPI</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="bank_transfer">Bank transfer</option>
                <option value="razorpay">Razorpay (online)</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="space-y-1.5">
              <span className="cms-label">Came from</span>
              <select className="cms-select" value={draft.source} onChange={(e) => set("source", e.target.value as Draft["source"])}>
                {Object.entries(SOURCE_LABEL).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1.5">
              <span className="cms-label">Order date</span>
              <input className="cms-input" type="date" value={draft.placedAt} onChange={(e) => set("placedAt", e.target.value)} />
            </label>
            <span />
            <label className="space-y-1.5 md:col-span-3">
              <span className="cms-label">Customer&apos;s note</span>
              <textarea className="cms-textarea min-h-[64px]" rows={2} value={draft.note ?? ""} onChange={(e) => set("note", e.target.value)} />
            </label>
            <label className="space-y-1.5 md:col-span-3">
              <span className="cms-label">Internal note (only the team sees this)</span>
              <textarea className="cms-textarea min-h-[64px]" rows={2} value={draft.internalNote ?? ""} onChange={(e) => set("internalNote", e.target.value)} />
            </label>
          </section>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[var(--cms-line)] bg-[var(--cms-surface)] px-6 py-4">
          {order ? (
            <button type="button" onClick={remove} className="cms-btn cms-btn-danger">
              <Icon name="trash" size={16} /> Delete
            </button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-3">
            {error && <p className="max-w-72 text-[12.5px] font-semibold text-[var(--cms-danger)]">{error}</p>}
            <button type="button" onClick={onClose} className="cms-btn">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="cms-btn cms-btn-primary">
              {saving ? "Saving…" : order ? "Save order" : `Record sale · ${inr(total)}`}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
