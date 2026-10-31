"use client";

import { api } from "@/lib/api/client";
import type { ApiImage, ApiMedia, ApiProduct } from "@/lib/api/types";
import type { Field } from "@/lib/admin/resources";
import { useEffect, useState } from "react";
import Icon from "./Icon";
import MediaDrop from "./MediaDrop";

type Props = {
  field: Field;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
};

/** Several photos at once: drop files to add, reorder, remove, edit alt text. */
function ImageGallery({ images, onChange }: { images: ApiImage[]; onChange: (v: ApiImage[]) => void }) {
  const [busy, setBusy] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addFiles = async (files: FileList | null) => {
    const list = Array.from(files ?? []).filter((f) => f.type.startsWith("image/"));
    if (!list.length) return;
    setBusy(list.length);
    setError(null);
    const added: ApiImage[] = [];
    for (const file of list) {
      try {
        const form = new FormData();
        form.append("file", file);
        form.append("alt", file.name.replace(/\.[^.]+$/, ""));
        const m = await api.post<ApiMedia>("/admin/media", form);
        added.push({ url: m.url, key: m.key, alt: m.alt });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
      }
      setBusy((b) => b - 1);
    }
    onChange([...images, ...added]);
  };

  const move = (i: number, dir: -1 | 1) => {
    const t = i + dir;
    if (t < 0 || t >= images.length) return;
    const next = [...images];
    [next[i], next[t]] = [next[t]!, next[i]!];
    onChange(next);
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {images.map((img, i) => (
          <div key={`${img.url}-${i}`} className="group overflow-hidden rounded-[10px] border border-[var(--cms-border)] bg-[var(--cms-surface)]">
            <div className="relative aspect-[3/4] bg-[var(--cms-sunken)]">
              {/* eslint-disable-next-line @next/next/no-img-element -- S3 or /public URLs */}
              <img src={img.url} alt="" className="h-full w-full object-cover" />
              {i === 0 && <span className="cms-chip cms-chip-accent absolute left-2 top-2">Cover</span>}
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-gradient-to-t from-black/60 to-transparent p-1.5 opacity-0 transition group-hover:opacity-100">
                <span className="flex">
                  <button type="button" aria-label="Move left" onClick={() => move(i, -1)} className="grid h-7 w-7 place-items-center rounded text-white hover:bg-white/20">
                    <Icon name="up" size={15} className="-rotate-90" />
                  </button>
                  <button type="button" aria-label="Move right" onClick={() => move(i, 1)} className="grid h-7 w-7 place-items-center rounded text-white hover:bg-white/20">
                    <Icon name="down" size={15} className="-rotate-90" />
                  </button>
                </span>
                <button type="button" aria-label="Remove" onClick={() => onChange(images.filter((_, j) => j !== i))} className="grid h-7 w-7 place-items-center rounded text-white hover:bg-white/20">
                  <Icon name="trash" size={15} />
                </button>
              </div>
            </div>
            <input
              className="w-full border-0 border-t border-[var(--cms-border)] px-2 py-1.5 text-[12px] outline-none"
              placeholder="Alt text"
              value={img.alt ?? ""}
              onChange={(e) => onChange(images.map((x, j) => (j === i ? { ...x, alt: e.target.value } : x)))}
            />
          </div>
        ))}

        <label
          data-dragging={dragging}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            addFiles(e.dataTransfer.files);
          }}
          className="cms-drop flex aspect-[3/4] cursor-pointer flex-col items-center justify-center gap-1 p-3 text-center"
        >
          <Icon name="plus" size={20} className="text-[var(--cms-accent)]" />
          <span className="text-[12.5px] font-semibold">{busy ? `Uploading ${busy}…` : "Add photos"}</span>
          <span className="cms-help">Drop or browse</span>
          <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }} />
        </label>
      </div>
      {error && <p className="mt-2 text-[12.5px] text-[var(--cms-danger)]">{error}</p>}
    </div>
  );
}

function ProductSelect({ value, onChange, disabled }: { value: unknown; onChange: (v: string) => void; disabled?: boolean }) {
  const [products, setProducts] = useState<ApiProduct[]>([]);

  useEffect(() => {
    api
      .list<ApiProduct>("/admin/products", { limit: 100 })
      .then((r) => setProducts(r.items))
      .catch(() => setProducts([]));
  }, []);

  // The API returns the populated product; the form stores its id.
  const id = typeof value === "object" && value !== null ? (value as ApiProduct).id : value;

  return (
    <select className="cms-select" value={typeof id === "string" ? id : ""} disabled={disabled} onChange={(e) => onChange(e.target.value)}>
      <option value="">Choose a product…</option>
      {products.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name} ({p.status})
        </option>
      ))}
    </select>
  );
}

export default function FieldInput({ field, value, onChange, error }: Props) {
  const disabled = field.readOnly;
  let control: React.ReactNode;

  switch (field.type) {
    case "textarea":
      control = (
        <textarea className="cms-textarea" rows={4} value={String(value ?? "")} disabled={disabled} onChange={(e) => onChange(e.target.value)} />
      );
      break;
    case "number":
      control = (
        <input
          type="number"
          className="cms-input"
          value={value === undefined || value === null ? "" : String(value)}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
        />
      );
      break;
    case "select":
      control = (
        <select className="cms-select" value={String(value ?? "")} disabled={disabled} onChange={(e) => onChange(e.target.value)}>
          {!field.required && <option value="">—</option>}
          {field.options?.map((o) => (
            <option key={o} value={o}>
              {o.replace("_", " ")}
            </option>
          ))}
        </select>
      );
      break;
    case "boolean":
      control = (
        <button
          type="button"
          role="switch"
          aria-checked={Boolean(value)}
          disabled={disabled}
          onClick={() => onChange(!value)}
          className={`relative h-6 w-11 rounded-full transition-colors ${value ? "bg-[var(--cms-accent)]" : "bg-[var(--cms-border-strong)]"}`}
        >
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${value ? "left-[22px]" : "left-0.5"}`} />
        </button>
      );
      break;
    case "list":
      control = (
        <textarea
          className="cms-textarea"
          rows={4}
          value={Array.isArray(value) ? value.join("\n") : ""}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value.split("\n"))}
        />
      );
      break;
    case "color":
      control = (
        <div className="flex items-center gap-3">
          <input type="color" className="h-10 w-14 cursor-pointer rounded-lg border border-[var(--cms-border)] bg-white p-1" value={String(value ?? "#000000")} disabled={disabled} onChange={(e) => onChange(e.target.value)} />
          <input className="cms-input max-w-[140px] font-mono" value={String(value ?? "")} disabled={disabled} onChange={(e) => onChange(e.target.value)} />
        </div>
      );
      break;
    case "date":
      control = (
        <input type="date" className="cms-input" value={typeof value === "string" ? value.slice(0, 10) : ""} disabled={disabled} onChange={(e) => onChange(e.target.value)} />
      );
      break;
    case "image": {
      const img = value as ApiImage | undefined;
      control = disabled ? null : (
        <div className="space-y-2">
          <MediaDrop kind="image" value={img?.url} onChange={(url) => onChange(url ? { ...img, url } : undefined)} />
          {img?.url && (
            <input className="cms-input" placeholder="Alt text (describes the photo)" value={img.alt ?? ""} onChange={(e) => onChange({ ...img, alt: e.target.value })} />
          )}
        </div>
      );
      break;
    }
    case "images":
      control = <ImageGallery images={Array.isArray(value) ? (value as ApiImage[]) : []} onChange={onChange} />;
      break;
    case "product":
      control = <ProductSelect value={value} onChange={onChange} disabled={disabled} />;
      break;
    default:
      control = <input className="cms-input" value={String(value ?? "")} disabled={disabled} onChange={(e) => onChange(e.target.value)} />;
  }

  return (
    <div className={field.type === "boolean" ? "flex items-center justify-between gap-3" : "space-y-1.5"}>
      <label className="cms-label">
        {field.label}
        {field.required && <span className="text-[var(--cms-accent)]"> *</span>}
      </label>
      {control}
      {field.hint && field.type !== "boolean" && <p className="cms-help">{field.hint}</p>}
      {error && <p className="text-[12.5px] text-[var(--cms-danger)]">{error}</p>}
    </div>
  );
}
