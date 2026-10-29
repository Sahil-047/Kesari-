"use client";

import { api } from "@/lib/api/client";
import type { ApiImage, ApiMedia, ApiProduct } from "@/lib/api/types";
import type { Field } from "@/lib/admin/resources";
import { useEffect, useState } from "react";

const inputClass =
  "w-full rounded border border-ink/15 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/50 disabled:bg-ink/5 disabled:text-ink/60";

type Props = {
  field: Field;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
};

/** Uploads a file to the S3 media library and returns it as an image. */
async function uploadImage(file: File): Promise<ApiImage> {
  const form = new FormData();
  form.append("file", file);
  form.append("alt", file.name.replace(/\.[^.]+$/, ""));
  const media = await api.post<ApiMedia>("/admin/media", form);
  return { url: media.url, key: media.key, alt: media.alt };
}

function ImageInput({
  value,
  onChange,
  disabled,
}: {
  value: ApiImage | undefined;
  onChange: (v: ApiImage | undefined) => void;
  disabled?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex gap-3">
      <div className="h-20 w-16 shrink-0 overflow-hidden rounded bg-ink/5">
        {value?.url && (
          // eslint-disable-next-line @next/next/no-img-element -- arbitrary CMS/S3 URLs
          <img src={value.url} alt="" className="h-full w-full object-cover" />
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <input
          className={inputClass}
          placeholder="Image URL or /images/… path"
          value={value?.url ?? ""}
          disabled={disabled}
          onChange={(e) =>
            onChange(e.target.value ? { ...value, url: e.target.value } : undefined)
          }
        />
        <input
          className={inputClass}
          placeholder="Alt text"
          value={value?.alt ?? ""}
          disabled={disabled || !value?.url}
          onChange={(e) => value && onChange({ ...value, alt: e.target.value })}
        />
        {!disabled && (
          <label className="inline-block cursor-pointer text-xs text-ink/70 underline underline-offset-4">
            {busy ? "Uploading…" : "Upload to S3"}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={busy}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setBusy(true);
                setError(null);
                try {
                  onChange(await uploadImage(file));
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Upload failed");
                } finally {
                  setBusy(false);
                  e.target.value = "";
                }
              }}
            />
          </label>
        )}
        {error && <p className="text-xs text-red-700">{error}</p>}
      </div>
    </div>
  );
}

function ProductSelect({
  value,
  onChange,
  disabled,
}: {
  value: unknown;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
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
    <select
      className={inputClass}
      value={typeof id === "string" ? id : ""}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    >
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
        <textarea
          rows={4}
          className={inputClass}
          value={String(value ?? "")}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      );
      break;
    case "number":
      control = (
        <input
          type="number"
          className={inputClass}
          value={value === undefined || value === null ? "" : String(value)}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
        />
      );
      break;
    case "select":
      control = (
        <select
          className={inputClass}
          value={String(value ?? "")}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        >
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
        <input
          type="checkbox"
          className="h-4 w-4 accent-[#14100b]"
          checked={Boolean(value)}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
      );
      break;
    case "list":
      control = (
        <textarea
          rows={4}
          className={inputClass}
          value={Array.isArray(value) ? value.join("\n") : ""}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value.split("\n"))}
        />
      );
      break;
    case "color":
      control = (
        <div className="flex items-center gap-3">
          <input
            type="color"
            className="h-9 w-12 cursor-pointer rounded border border-ink/15"
            value={String(value ?? "#000000")}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
          />
          <span className="font-mono text-xs text-ink/60">{String(value ?? "")}</span>
        </div>
      );
      break;
    case "date":
      control = (
        <input
          type="date"
          className={inputClass}
          value={typeof value === "string" ? value.slice(0, 10) : ""}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      );
      break;
    case "image":
      control = (
        <ImageInput
          value={value as ApiImage | undefined}
          onChange={onChange}
          disabled={disabled}
        />
      );
      break;
    case "images": {
      const images = Array.isArray(value) ? (value as ApiImage[]) : [];
      control = (
        <div className="space-y-3">
          {images.map((img, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="flex-1">
                <ImageInput
                  value={img}
                  disabled={disabled}
                  onChange={(next) =>
                    onChange(
                      next
                        ? images.map((x, j) => (j === i ? next : x))
                        : images.filter((_, j) => j !== i),
                    )
                  }
                />
              </div>
              <button
                type="button"
                className="text-xs text-ink/50 hover:text-red-700"
                onClick={() => onChange(images.filter((_, j) => j !== i))}
              >
                Remove
              </button>
            </div>
          ))}
          {!disabled && (
            <button
              type="button"
              className="text-xs text-ink/70 underline underline-offset-4"
              onClick={() => onChange([...images, { url: "", alt: "" }])}
            >
              + Add image
            </button>
          )}
        </div>
      );
      break;
    }
    case "product":
      control = <ProductSelect value={value} onChange={onChange} disabled={disabled} />;
      break;
    default:
      control = (
        <input
          className={inputClass}
          value={String(value ?? "")}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }

  return (
    <div className={field.type === "boolean" ? "flex items-center gap-3" : "space-y-1.5"}>
      <label className="block text-[0.7rem] font-medium uppercase tracking-[0.14em] text-ink/60">
        {field.label}
        {field.required && <span className="text-red-700"> *</span>}
      </label>
      {control}
      {field.hint && <p className="text-xs text-ink/45">{field.hint}</p>}
      {error && <p className="text-xs text-red-700">{error}</p>}
    </div>
  );
}
