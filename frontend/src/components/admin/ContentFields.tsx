"use client";

import type { PageFieldDef, RepeaterField, SimpleField } from "@/lib/admin/pageDefinitions";
import { useState, type ReactNode } from "react";
import Icon from "./Icon";
import MediaDrop from "./MediaDrop";

type Item = Record<string, string>;

/** Inputs for website-content fields: text, long text, link, image, video. */
function SimpleInput({
  field,
  value,
  onChange,
}: {
  field: SimpleField;
  value: string;
  onChange: (v: string) => void;
}) {
  if (field.type === "image" || field.type === "video") {
    return <MediaDrop kind={field.type} value={value} onChange={onChange} />;
  }
  if (field.type === "textarea") {
    return (
      <textarea
        className="cms-textarea"
        rows={3}
        value={value}
        placeholder={field.placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  return (
    <input
      className="cms-input"
      value={value}
      placeholder={field.placeholder ?? (field.type === "link" ? "/page or https://…" : undefined)}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function FieldBlock({ field, children }: { field: { label: string; help?: string }; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="cms-label">{field.label}</label>
      {children}
      {field.help && <p className="cms-help">{field.help}</p>}
    </div>
  );
}

/** A list of items (pieces, moments, steps…) that can be added, edited, reordered and removed. */
function Repeater({
  field,
  items,
  onChange,
}: {
  field: RepeaterField;
  items: Item[];
  onChange: (items: Item[]) => void;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const image = field.fields.find((f) => f.type === "image");

  const update = (i: number, name: string, v: string) =>
    onChange(items.map((it, j) => (j === i ? { ...it, [name]: v } : it)));
  const move = (i: number, dir: -1 | 1) => {
    const t = i + dir;
    if (t < 0 || t >= items.length) return;
    const next = [...items];
    [next[i], next[t]] = [next[t]!, next[i]!];
    onChange(next);
    setOpen((o) => (o === i ? t : o === t ? i : o));
  };

  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className="cms-card-quiet overflow-hidden">
            <div className="flex items-center gap-3 px-3 py-2">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
                aria-expanded={isOpen}
              >
                <span className="cms-mono w-6 shrink-0 text-center text-[11px] text-[var(--cms-muted)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {image && (
                  <span className="h-11 w-9 shrink-0 overflow-hidden rounded-[3px] border border-[var(--cms-border)] bg-[var(--cms-sunken)]">
                    {item[image.name] && (
                      // eslint-disable-next-line @next/next/no-img-element -- S3 or /public URLs
                      <img src={item[image.name]} alt="" className="h-full w-full object-cover" />
                    )}
                  </span>
                )}
                <span className="min-w-0 flex-1 truncate font-semibold">
                  {item[field.titleField] || <span className="text-[var(--cms-muted)]">Untitled</span>}
                </span>
                <span className="cms-mono text-[10.5px] uppercase tracking-[0.08em] text-[var(--cms-accent-ink)]">
                  {isOpen ? "Close" : "Edit"}
                </span>
              </button>
              <div className="flex shrink-0 items-center">
                <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)} className="cms-btn cms-btn-ghost cms-btn-sm px-2">
                  <Icon name="up" size={16} />
                </button>
                <button type="button" aria-label="Move down" disabled={i === items.length - 1} onClick={() => move(i, 1)} className="cms-btn cms-btn-ghost cms-btn-sm px-2">
                  <Icon name="down" size={16} />
                </button>
                <button
                  type="button"
                  aria-label="Remove"
                  onClick={() => {
                    if (window.confirm("Remove this item?")) {
                      onChange(items.filter((_, j) => j !== i));
                      setOpen(null);
                    }
                  }}
                  className="cms-btn cms-btn-danger cms-btn-sm px-2"
                >
                  <Icon name="trash" size={16} />
                </button>
              </div>
            </div>
            {isOpen && (
              <div className="grid gap-4 border-t border-[var(--cms-border)] bg-[var(--cms-sunken)] p-4 md:grid-cols-2">
                {field.fields.map((f) => (
                  <div key={f.name} className={f.type === "image" || f.type === "video" || f.type === "textarea" ? "md:col-span-2" : ""}>
                    <FieldBlock field={f}>
                      <SimpleInput field={f} value={item[f.name] ?? ""} onChange={(v) => update(i, f.name, v)} />
                    </FieldBlock>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {(!field.max || items.length < field.max) && (
        <button
          type="button"
          onClick={() => {
            onChange([...items, Object.fromEntries(field.fields.map((f) => [f.name, ""]))]);
            setOpen(items.length);
          }}
          className="cms-btn w-full border-dashed"
        >
          <Icon name="plus" size={16} /> {field.addLabel}
        </button>
      )}
    </div>
  );
}

/** One field of a website section, whatever its type. */
export function SectionField({
  field,
  value,
  onChange,
}: {
  field: PageFieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  if (field.type === "repeater") {
    return (
      <FieldBlock field={field}>
        <Repeater field={field} items={Array.isArray(value) ? (value as Item[]) : []} onChange={onChange} />
      </FieldBlock>
    );
  }
  return (
    <FieldBlock field={field}>
      <SimpleInput field={field} value={typeof value === "string" ? value : ""} onChange={onChange} />
    </FieldBlock>
  );
}

/** Fields that need the full row width. */
export function isWideField(field: PageFieldDef): boolean {
  return ["repeater", "image", "video", "textarea"].includes(field.type);
}
