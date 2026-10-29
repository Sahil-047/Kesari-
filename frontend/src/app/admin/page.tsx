"use client";

import { api } from "@/lib/api/client";
import type { ApiEnquiry } from "@/lib/api/types";
import Link from "next/link";
import { useEffect, useState } from "react";

const COUNTS = [
  { label: "Products", path: "/admin/products", href: "/admin/products" },
  { label: "Collections", path: "/admin/collections", href: "/admin/collections" },
  { label: "Crafts", path: "/admin/crafts", href: "/admin/crafts" },
  { label: "New enquiries", path: "/admin/enquiries", query: { status: "new" }, href: "/admin/enquiries" },
] as const;

export default function AdminOverviewPage() {
  const [totals, setTotals] = useState<(number | null)[]>(COUNTS.map(() => null));
  const [latest, setLatest] = useState<ApiEnquiry[]>([]);

  useEffect(() => {
    Promise.all(
      COUNTS.map((c) =>
        api
          .list(c.path, { limit: 1, ...("query" in c ? c.query : {}) })
          .then((r) => r.meta.total)
          .catch(() => null),
      ),
    ).then(setTotals);
    api
      .list<ApiEnquiry>("/admin/enquiries", { limit: 5 })
      .then((r) => setLatest(r.items))
      .catch(() => setLatest([]));
  }, []);

  return (
    <div>
      <h1 className="display text-3xl uppercase tracking-[0.1em]">Overview</h1>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {COUNTS.map((c, i) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded border border-ink/10 bg-white p-5 transition-colors hover:border-ink/30"
          >
            <span className="block text-[0.65rem] uppercase tracking-[0.16em] text-ink/50">
              {c.label}
            </span>
            <span className="mt-2 block text-3xl tabular-nums text-ink">{totals[i] ?? "—"}</span>
          </Link>
        ))}
      </div>

      <h2 className="mt-12 text-sm font-medium uppercase tracking-[0.14em] text-ink/60">
        Latest enquiries
      </h2>
      <ul className="mt-4 divide-y divide-ink/10 rounded border border-ink/10 bg-white">
        {latest.length === 0 && <li className="px-5 py-6 text-sm text-ink/50">No enquiries yet.</li>}
        {latest.map((e) => (
          <li key={e.id} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
            <span className="min-w-0">
              <span className="block truncate text-ink">{e.name}</span>
              <span className="block truncate text-xs text-ink/50">{e.note || e.email}</span>
            </span>
            <span className="shrink-0 text-xs text-ink/50">
              {new Date(e.createdAt).toLocaleDateString("en-IN")} · {e.status.replace("_", " ")}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
