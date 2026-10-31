"use client";

import { api, ApiRequestError, type PageMeta } from "@/lib/api/client";
import type { Column, ResourceConfig } from "@/lib/admin/resources";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import FieldInput from "./FieldInput";
import Icon from "./Icon";
import ScreenHeader from "./ScreenHeader";

type Row = { id: string } & Record<string, unknown>;

function getPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>(
    (acc, key) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[key] : undefined),
    obj,
  );
}

const CHIP: Record<string, string> = {
  published: "cms-chip-success",
  closed: "cms-chip-success",
  new: "cms-chip-accent",
  in_progress: "cms-chip-warning",
  draft: "",
};

function Cell({ row, column }: { row: Row; column: Column }) {
  const value = getPath(row, column.key);
  switch (column.format) {
    case "image":
      return (
        <div className="h-12 w-10 overflow-hidden rounded-md bg-[var(--cms-sunken)]">
          {typeof value === "string" && value && (
            // eslint-disable-next-line @next/next/no-img-element -- S3 or /public URLs
            <img src={value} alt="" className="h-full w-full object-cover" />
          )}
        </div>
      );
    case "price":
      return <span className="tabular-nums">₹{Number(value ?? 0).toLocaleString("en-IN")}</span>;
    case "date":
      return <>{typeof value === "string" ? new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}</>;
    case "product":
      return <>{(value as { name?: string } | null)?.name ?? "Missing product"}</>;
    case "status": {
      const s = String(value ?? "");
      return <span className={`cms-chip ${CHIP[s] ?? ""}`}>{s.replace("_", " ")}</span>;
    }
    default:
      if (typeof value === "boolean") {
        return <span className={`cms-chip ${value ? "cms-chip-success" : ""}`}>{value ? "Yes" : "No"}</span>;
      }
      return <>{String(value ?? "—")}</>;
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

export default function ResourceManager({ config, description }: { config: ResourceConfig; description?: string }) {
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
    // Data fetching on mount and whenever the query changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const open = useCallback(
    (row: Row | "new") => {
      setEditing(row);
      setValues(row === "new" ? { ...config.defaults } : { ...row });
      setFieldErrors({});
      setFormError(null);
    },
    [config.defaults],
  );

  // Dashboard shortcuts link here with ?new=1.
  useEffect(() => {
    if (config.canCreate && new URLSearchParams(window.location.search).get("new") === "1") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      open("new");
    }
  }, [config.canCreate, open]);

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
        setFieldErrors(Object.fromEntries(err.details.map((d) => [d.path.split(".")[0] ?? d.path, d.message])));
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

  const wide = (type: string) => ["images", "image", "textarea", "list"].includes(type);

  return (
    <div>
      <ScreenHeader
        title={config.title}
        description={description ?? (meta ? `${meta.total} in total` : undefined)}
        actions={
          config.canCreate && (
            <button type="button" onClick={() => open("new")} className="cms-btn cms-btn-primary">
              <Icon name="plus" size={16} /> New {config.singular}
            </button>
          )
        }
      />

      <div className="mx-auto max-w-[1240px] px-8 py-6">
        {(config.searchable || config.filters) && (
          <div className="mb-4 flex flex-wrap gap-2">
            {config.searchable && (
              <input
                placeholder={`Search ${config.title.toLowerCase()}…`}
                className="cms-input max-w-xs"
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
                className="cms-select w-auto min-w-[150px]"
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

        {listError && (
          <p className="mb-4 rounded-[10px] bg-[var(--cms-danger-soft)] px-4 py-3 font-semibold text-[var(--cms-danger)]">{listError}</p>
        )}

        <div className="cms-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="cms-table">
              <thead>
                <tr>
                  {config.columns.map((c) => (
                    <th key={c.key}>{c.label}</th>
                  ))}
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {loading && rows.length === 0 ? (
                  <tr>
                    <td colSpan={config.columns.length + 1} className="py-12 text-center text-[var(--cms-muted)]">
                      Loading…
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={config.columns.length + 1} className="py-14 text-center">
                      <p className="cms-display text-[18px] text-[var(--cms-ink)]">No {config.title.toLowerCase()} yet</p>
                      {config.canCreate && (
                        <button type="button" onClick={() => open("new")} className="cms-btn cms-btn-primary mt-4">
                          <Icon name="plus" size={16} /> Add the first {config.singular}
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.id} onClick={() => open(row)} className="cursor-pointer">
                      {config.columns.map((c) => (
                        <td key={c.key}>
                          <Cell row={row} column={c} />
                        </td>
                      ))}
                      <td className="text-right text-[var(--cms-muted)]">
                        <Icon name="arrow" size={16} />
                      </td>
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
        <div className="fixed inset-0 z-50 flex justify-end bg-[rgba(26,23,20,0.35)]" onClick={() => setEditing(null)}>
          <form
            onSubmit={save}
            onClick={(e) => e.stopPropagation()}
            className="flex h-full w-full max-w-[680px] flex-col bg-[var(--cms-canvas)] shadow-[var(--cms-shadow-lg)]"
          >
            <div className="flex items-center justify-between border-b border-[var(--cms-border)] bg-[var(--cms-surface)] px-6 py-4">
              <div>
                <p className="cms-eyebrow">{config.title}</p>
                <h2 className="cms-display text-[22px]">
                  {editing === "new" ? `New ${config.singular}` : String(editing.name ?? editing.title ?? `Edit ${config.singular}`)}
                </h2>
              </div>
              <button type="button" onClick={() => setEditing(null)} className="cms-btn cms-btn-ghost">
                Close
              </button>
            </div>

            <div className="cms-scroll flex-1 overflow-y-auto p-6">
              <div className="cms-card grid gap-5 p-5 md:grid-cols-2">
                {config.fields.map((field) => (
                  <div key={field.name} className={wide(field.type) ? "md:col-span-2" : ""}>
                    <FieldInput
                      field={field}
                      value={values[field.name]}
                      error={fieldErrors[field.name]}
                      onChange={(v) => setValues((prev) => ({ ...prev, [field.name]: v }))}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-[var(--cms-border)] bg-[var(--cms-surface)] px-6 py-4">
              {editing !== "new" ? (
                <button type="button" onClick={remove} className="cms-btn cms-btn-danger">
                  <Icon name="trash" size={16} /> Delete
                </button>
              ) : (
                <span />
              )}
              <div className="flex items-center gap-3">
                {formError && <p className="max-w-64 text-[12.5px] font-semibold text-[var(--cms-danger)]">{formError}</p>}
                <button type="button" onClick={() => setEditing(null)} className="cms-btn">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="cms-btn cms-btn-primary">
                  {saving ? "Saving…" : editing === "new" ? `Create ${config.singular}` : "Save changes"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
