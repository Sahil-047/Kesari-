"use client";

import Icon from "@/components/admin/Icon";
import ScreenHeader from "@/components/admin/ScreenHeader";
import { api, type PageMeta } from "@/lib/api/client";
import type { ApiMedia } from "@/lib/api/types";
import { useCallback, useEffect, useRef, useState } from "react";

function formatSize(bytes: number) {
  return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

export default function AdminMediaPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<ApiMedia[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [page, setPage] = useState(1);
  const [type, setType] = useState<"" | "image" | "video">("");
  const [uploading, setUploading] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await api.list<ApiMedia>("/admin/media", { page, limit: 24, type: type || undefined });
      setItems(r.items);
      setMeta(r.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load media");
    }
  }, [page, type]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const upload = async (files: FileList | null) => {
    const list = Array.from(files ?? []);
    if (!list.length) return;
    setUploading(list.length);
    setError(null);
    for (const file of list) {
      try {
        const form = new FormData();
        form.append("file", file);
        form.append("alt", file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
        await api.post("/admin/media", form);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      }
      setUploading((n) => n - 1);
    }
    await load();
  };

  const remove = async (m: ApiMedia) => {
    if (!window.confirm("Delete this file from S3? Pages still using it will show a broken image.")) return;
    try {
      await api.delete(`/admin/media/${m.id}`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete");
    }
  };

  const saveAlt = async (m: ApiMedia, alt: string) => {
    if (alt === m.alt) return;
    try {
      await api.patch(`/admin/media/${m.id}`, { alt });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save alt text");
    }
  };

  return (
    <div>
      <ScreenHeader
        title="Media library"
        description={meta ? `${meta.total} files stored on S3` : "Photos and films stored on S3."}
        actions={
          <button type="button" className="cms-btn cms-btn-primary" onClick={() => inputRef.current?.click()}>
            <Icon name="plus" size={16} /> Upload
          </button>
        }
      />

      <div className="mx-auto max-w-[1240px] px-8 py-6">
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
            upload(e.dataTransfer.files);
          }}
          className="cms-drop flex cursor-pointer flex-col items-center justify-center gap-2 px-6 py-10 text-center"
        >
          <span className="grid h-12 w-12 place-items-center rounded-full bg-[var(--cms-accent-soft)] text-[var(--cms-accent-ink)]">
            <Icon name="image" size={22} />
          </span>
          <span className="cms-display text-[18px]">
            {uploading ? `Uploading ${uploading} file${uploading === 1 ? "" : "s"}…` : "Drop photos or films here"}
          </span>
          <span className="cms-help">JPG, PNG, WebP, AVIF, MP4 or WebM · several at once is fine</span>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*,video/mp4,video/webm"
            className="sr-only"
            onChange={(e) => {
              upload(e.target.files);
              e.target.value = "";
            }}
          />
        </label>

        <div className="mt-6 flex items-center gap-1">
          {(["", "image", "video"] as const).map((t) => (
            <button
              key={t || "all"}
              type="button"
              onClick={() => {
                setPage(1);
                setType(t);
              }}
              className={`cms-btn cms-btn-sm ${type === t ? "cms-btn-dark" : "cms-btn-ghost"}`}
            >
              {t === "" ? "All" : t === "image" ? "Photos" : "Films"}
            </button>
          ))}
        </div>

        {error && (
          <p className="mt-4 rounded-[10px] bg-[var(--cms-danger-soft)] px-4 py-3 font-semibold text-[var(--cms-danger)]">{error}</p>
        )}

        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {items.map((m) => (
            <figure key={m.id} className="cms-card group overflow-hidden">
              <div className="relative aspect-[3/4] bg-[var(--cms-sunken)]">
                {m.mimeType.startsWith("image/") ? (
                  // eslint-disable-next-line @next/next/no-img-element -- S3 URLs
                  <img src={m.url} alt={m.alt} className="h-full w-full object-cover" />
                ) : (
                  <video src={m.url} className="h-full w-full object-cover" muted />
                )}
                <div className="absolute inset-x-0 top-0 flex justify-end gap-1 p-2 opacity-0 transition group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(m.url);
                      setCopied(m.id);
                      setTimeout(() => setCopied(null), 1500);
                    }}
                    className="cms-btn cms-btn-sm bg-white"
                  >
                    {copied === m.id ? "Copied" : "Copy link"}
                  </button>
                  <button type="button" aria-label="Delete" onClick={() => remove(m)} className="cms-btn cms-btn-sm bg-white px-2 text-[var(--cms-danger)]">
                    <Icon name="trash" size={15} />
                  </button>
                </div>
              </div>
              <figcaption className="space-y-1.5 p-2.5">
                <input
                  defaultValue={m.alt}
                  placeholder="Describe this file"
                  onBlur={(e) => saveAlt(m, e.target.value)}
                  className="w-full rounded-md border border-transparent px-1.5 py-1 text-[12.5px] font-semibold outline-none hover:border-[var(--cms-border)] focus:border-[var(--cms-accent)]"
                />
                <p className="px-1.5 text-[11.5px] text-[var(--cms-muted)]">{formatSize(m.size)}</p>
              </figcaption>
            </figure>
          ))}
        </div>

        {meta && meta.total === 0 && (
          <p className="py-10 text-center text-[var(--cms-muted)]">Nothing uploaded yet.</p>
        )}

        {meta && meta.pages > 1 && (
          <div className="mt-6 flex items-center justify-end gap-2">
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
    </div>
  );
}
