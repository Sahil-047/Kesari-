"use client";

import { api, ApiRequestError, type PageMeta } from "@/lib/api/client";
import type { Column, ResourceConfig } from "@/lib/admin/resources";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import FieldInput from "./FieldInput";

type Row = { id: string } & Record<string, unknown>;

function getPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>(
    (acc, key) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[key] : undefined),
    obj,
  );
}

function Cell({ row, column }: { row: Row; column: Column }) {
  const value = getPath(row, column.key);
  switch (column.format) {
    case "image":
      return (
        <div className="h-12 w-9 overflow-hidden rounded bg-ink/5">
          {typeof value === "string" && value && (
            // eslint-disable-next-line @next/next/no-img-element -- arbitrary CMS/S3 URLs
            <img src={value} alt="" className="h-full w-full object-cover" />
          )}
        </div>
      );
    case "price":
      return <>₹{Number(value ?? 0).toLocaleString("en-IN")}</>;
    case "date":
      return <>{typeof value === "string" ? new Date(value).toLocaleDateString("en-IN") : "—"}</>;
    case "product":
      return <>{(value as { name?: string } | null)?.name ?? "Missing product"}</>;
    case "status": {
      const s = String(value ?? "");
      const tone =
        s === "published" || s === "closed"
          ? "bg-emerald-100 text-emerald-900"
          : s === "new"
            ? "bg-amber-100 text-amber-900"
            : "bg-ink/10 text-ink/70";
      return <span className={`rounded px-2 py-0.5 text-xs ${tone}`}>{s.replace("_", " ")}</span>;
    }
    default:
      return <>{typeof value === "boolean" ? (value ? "Yes" : "No") : String(value ?? "—")}</>;
  }
}

/** Turns form state into an API payload: editable fields only, blanks dropped. */
function toPayload(config: ResourceConfig, values: Record<string, unknown>, isNew: boolean) {
  const payload: Record<string, unknown> = {};
  for (const field of config.fields) {
    if (field.readOnly) continue;
    let value = values[field.name];
    if (field.type === "list" && Array.isArray(value)) {
      value = value.map((v) => String(v).trim()).filter(Boolean);
    }
    if (field.type === "images" && Array.isArray(value)) {
      value = value.filter((img) => img && (img as { url?: string }).url);
    }
    if (field.type === "product" && value && typeof value === "object") {
      value = (value as { id: string }).id;
    }
    if (value === "" || value === undefined || value === null) {
      // Blank optional fields are left out; on update a blank password keeps the old one.
      if (!isNew || !field.required) continue;
    }
    payload[field.name] = value;
  }
  return payload;
}

export default function ResourceManager({ config }: { config: ResourceConfig }) {
  const base = `/admin${config.endpoint}`;
  const [rows, setRows] = useState<Row[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [editing, setEditing] = useState<Row | "new" | null>(null);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      if (config.unpaged) {
        setRows(await api.get<Row[]>(base));
        setMeta(null);
      } else {
        const result = await api.list<Row>(base, { page, limit: 20, search, ...filters });
        setRows(result.items);
        setMeta(result.meta);
      }
    } catch (err) {
      setListError(err instanceof Error ? err.message : "Could not load");
    } finally {
      setLoading(false);
    }
  }, [base, config.unpaged, page, search, filters]);

  useEffect(() => {
    // Data fetching on mount and when the query changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const open = (row: Row | "new") => {
    setEditing(row);
    setValues(row === "new" ? { ...config.defaults } : { ...row });
    setFieldErrors({});
    setFormError(null);
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const isNew = editing === "new";
    setSaving(true);
    setFieldErrors({});
    setFormError(null);
    try {
      const payload = toPayload(config, values, isNew);
      if (isNew) await api.post(base, payload);
      else await api.patch(`${base}/${editing.id}`, payload);
      setEditing(null);
      await load();
    } catch (err) {
      if (err instanceof ApiRequestError && err.details) {
        setFieldErrors(
          Object.fromEntries(err.details.map((d) => [d.path.split(".")[0] ?? d.path, d.message])),
        );
      }
      setFormError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!editing || editing === "new") return;
    if (!window.confirm(`Delete this ${config.singular}? This cannot be undone.`)) return;
    try {
      await api.delete(`${base}/${editing.id}`);
      setEditing(null);
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not delete");
    }
  };

  const move = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[index], next[target]] = [next[target]!, next[index]!];
    setRows(next);
    try {
      setRows(await api.put<Row[]>(`${base}/order`, { ids: next.map((r) => r.id) }));
    } catch (err) {
      setListError(err instanceof Error ? err.message : "Could not reorder");
      await load();
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-3xl uppercase tracking-[0.1em]">{config.title}</h1>
          {meta && <p className="mt-1 text-xs text-ink/50">{meta.total} in total</p>}
        </div>
        {config.canCreate && (
          <button
            type="button"
            onClick={() => open("new")}
            className="rounded bg-[#14100b] px-4 py-2 text-sm text-cream"
          >
            New {config.singular}
          </button>
        )}
      </div>

      {(config.searchable || config.filters) && (
        <div className="mt-6 flex flex-wrap gap-3">
          {config.searchable && (
            <input
              placeholder="Search…"
              className="w-64 rounded border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-ink/50"
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
            />
          )}
          {config.filters?.map((f) => (
            <select
              key={f.name}
              className="rounded border border-ink/15 bg-white px-3 py-2 text-sm"
              value={filters[f.name] ?? ""}
              onChange={(e) => {
                setPage(1);
                setFilters((prev) => ({ ...prev, [f.name]: e.target.value }));
              }}
            >
              <option value="">All {f.label.toLowerCase()}</option>
              {f.options.map((o) => (
                <option key={o} value={o}>
                  {o.replace("_", " ")}
                </option>
              ))}
            </select>
          ))}
        </div>
      )}

      {listError && <p className="mt-4 text-sm text-red-700">{listError}</p>}

      <div className="mt-6 overflow-x-auto rounded border border-ink/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 text-[0.65rem] uppercase tracking-[0.14em] text-ink/50">
            <tr>
              {config.orderable && <th className="w-20 px-4 py-3">Order</th>}
              {config.columns.map((c) => (
                <th key={c.key} className="px-4 py-3 font-medium">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && rows.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-ink/50" colSpan={config.columns.length + 1}>
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-ink/50" colSpan={config.columns.length + 1}>
                  Nothing here yet.
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr
                  key={row.id}
                  onClick={() => open(row)}
                  className="cursor-pointer border-b border-ink/5 last:border-0 hover:bg-ink/[0.03]"
                >
                  {config.orderable && (
                    <td className="px-4 py-2" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-1">
                        {([-1, 1] as const).map((dir) => (
                          <button
                            key={dir}
                            type="button"
                            aria-label={dir === -1 ? "Move up" : "Move down"}
                            disabled={i + dir < 0 || i + dir >= rows.length}
                            onClick={() => move(i, dir)}
                            className="grid h-7 w-7 place-items-center rounded border border-ink/15 text-xs disabled:opacity-30"
                          >
                            {dir === -1 ? "↑" : "↓"}
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                  {config.columns.map((c) => (
                    <td key={c.key} className="px-4 py-2">
                      <Cell row={row} column={c} />
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {meta && meta.pages > 1 && (
        <div className="mt-4 flex items-center gap-3 text-sm">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded border border-ink/15 px-3 py-1 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-ink/60">
            Page {meta.page} of {meta.pages}
          </span>
          <button
            type="button"
            disabled={page >= meta.pages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded border border-ink/15 px-3 py-1 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={() => setEditing(null)}>
          <form
            onSubmit={save}
            onClick={(e) => e.stopPropagation()}
            className="flex h-full w-full max-w-xl flex-col bg-[#faf7f1] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
              <h2 className="text-lg font-medium">
                {editing === "new" ? `New ${config.singular}` : `Edit ${config.singular}`}
              </h2>
              <button type="button" onClick={() => setEditing(null)} className="text-sm text-ink/60">
                Close
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
              {config.fields.map((field) => (
                <FieldInput
                  key={field.name}
                  field={field}
                  value={values[field.name]}
                  error={fieldErrors[field.name]}
                  onChange={(v) => setValues((prev) => ({ ...prev, [field.name]: v }))}
                />
              ))}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-ink/10 px-6 py-4">
              {editing !== "new" ? (
                <button type="button" onClick={remove} className="text-sm text-red-700">
                  Delete
                </button>
              ) : (
                <span />
              )}
              <div className="flex items-center gap-3">
                {formError && <p className="max-w-56 text-xs text-red-700">{formError}</p>}
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded bg-[#14100b] px-5 py-2 text-sm text-cream disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
