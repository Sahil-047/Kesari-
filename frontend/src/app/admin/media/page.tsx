"use client";

import { api, type PageMeta } from "@/lib/api/client";
import type { ApiMedia } from "@/lib/api/types";
import { useCallback, useEffect, useState } from "react";

function formatSize(bytes: number) {
  return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

export default function AdminMediaPage() {
  const [items, setItems] = useState<ApiMedia[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await api.list<ApiMedia>("/admin/media", { page, limit: 24 });
      setItems(r.items);
      setMeta(r.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load media");
    }
  }, [page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.append("file", file);
        form.append("alt", file.name.replace(/\.[^.]+$/, ""));
        await api.post("/admin/media", form);
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-3xl uppercase tracking-[0.1em]">Media</h1>
          {meta && <p className="mt-1 text-xs text-ink/50">{meta.total} files on S3</p>}
        </div>
        <label className="cursor-pointer rounded bg-[#14100b] px-4 py-2 text-sm text-cream">
          {busy ? "Uploading…" : "Upload files"}
          <input
            type="file"
            multiple
            accept="image/*,video/mp4,video/webm"
            className="sr-only"
            disabled={busy}
            onChange={(e) => {
              upload(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {items.map((m) => (
          <figure key={m.id} className="overflow-hidden rounded border border-ink/10 bg-white">
            <div className="aspect-[3/4] bg-ink/5">
              {m.mimeType.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element -- S3 URLs
                <img src={m.url} alt={m.alt} className="h-full w-full object-cover" />
              ) : (
                <video src={m.url} className="h-full w-full object-cover" muted />
              )}
            </div>
            <figcaption className="space-y-2 p-3 text-xs">
              <input
                defaultValue={m.alt}
                placeholder="Alt text"
                onBlur={(e) => saveAlt(m, e.target.value)}
                className="w-full rounded border border-ink/15 px-2 py-1"
              />
              <div className="flex items-center justify-between text-ink/50">
                <span>{formatSize(m.size)}</span>
                <span className="flex gap-3">
                  <button type="button" onClick={() => navigator.clipboard.writeText(m.url)}>
                    Copy URL
                  </button>
                  <button type="button" onClick={() => remove(m)} className="text-red-700">
                    Delete
                  </button>
                </span>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>

      {meta && meta.pages > 1 && (
        <div className="mt-6 flex items-center gap-3 text-sm">
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded border border-ink/15 px-3 py-1 disabled:opacity-40">
            Previous
          </button>
          <span className="text-ink/60">
            Page {meta.page} of {meta.pages}
          </span>
          <button type="button" disabled={page >= meta.pages} onClick={() => setPage((p) => p + 1)} className="rounded border border-ink/15 px-3 py-1 disabled:opacity-40">
            Next
          </button>
        </div>
      )}
    </div>
  );
}
