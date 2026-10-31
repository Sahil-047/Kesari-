"use client";

import { api, type PageMeta } from "@/lib/api/client";
import type { ApiMedia } from "@/lib/api/types";
import { useCallback, useEffect, useRef, useState } from "react";

type Kind = "image" | "video";

async function uploadFile(file: File): Promise<ApiMedia> {
  const form = new FormData();
  form.append("file", file);
  form.append("alt", file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
  return api.post<ApiMedia>("/admin/media", form);
}

/** Pick an already-uploaded file. */
function LibraryPicker({
  kind,
  onPick,
  onClose,
}: {
  kind: Kind;
  onPick: (url: string) => void;
  onClose: () => void;
}) {
  const [items, setItems] = useState<ApiMedia[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .list<ApiMedia>("/admin/media", { type: kind, page, limit: 24 })
      .then((r) => {
        setItems(r.items);
        setMeta(r.meta);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load the library"));
  }, [kind, page]);

  return (
    <div
      className="fixed inset-0 z-[70] grid place-items-center bg-[rgba(26,23,20,0.45)] p-6"
      onClick={onClose}
    >
      <div
        className="cms-card flex max-h-[80vh] w-full max-w-3xl flex-col overflow-hidden shadow-[var(--cms-shadow-lg)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--cms-border)] px-5 py-4">
          <p className="cms-display text-lg">Choose from library</p>
          <button type="button" className="cms-btn cms-btn-ghost cms-btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="cms-scroll flex-1 overflow-y-auto p-5">
          {error && <p className="text-[var(--cms-danger)]">{error}</p>}
          {!error && items.length === 0 && (
            <p className="py-10 text-center text-[var(--cms-muted)]">
              Nothing uploaded yet. Drop a file into the field instead.
            </p>
          )}
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {items.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onPick(m.url)}
                className="group overflow-hidden rounded-lg border border-[var(--cms-border)] text-left transition hover:border-[var(--cms-accent)]"
              >
                <div className="aspect-[3/4] bg-[var(--cms-sunken)]">
                  {kind === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element -- S3 URLs
                    <img src={m.url} alt={m.alt} className="h-full w-full object-cover" />
                  ) : (
                    <video src={m.url} muted className="h-full w-full object-cover" />
                  )}
                </div>
                <p className="truncate px-2 py-1.5 text-[12px] text-[var(--cms-ink-2)]">
                  {m.alt || m.originalName}
                </p>
              </button>
            ))}
          </div>
        </div>
        {meta && meta.pages > 1 && (
          <div className="flex items-center justify-end gap-2 border-t border-[var(--cms-border)] px-5 py-3">
            <button type="button" className="cms-btn cms-btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </button>
            <span className="cms-help">
              {meta.page} / {meta.pages}
            </span>
            <button type="button" className="cms-btn cms-btn-sm" disabled={page >= meta.pages} onClick={() => setPage((p) => p + 1)}>
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * The one control for every image or video field: drop a file (uploaded to S3
 * straight away), pick from the library, or paste a link.
 */
export default function MediaDrop({
  kind = "image",
  value,
  onChange,
  compact = false,
}: {
  kind?: Kind;
  value: string | undefined;
  onChange: (url: string) => void;
  compact?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [library, setLibrary] = useState(false);
  const [linkMode, setLinkMode] = useState(false);

  const accept = kind === "image" ? "image/*" : "video/mp4,video/webm";

  const handleFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      if (!file.type.startsWith(`${kind}/`)) {
        setError(kind === "image" ? "That isn't an image." : "That isn't a video.");
        return;
      }
      setBusy(true);
      setError(null);
      try {
        onChange((await uploadFile(file)).url);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setBusy(false);
      }
    },
    [kind, onChange],
  );

  const previewHeight = compact ? "h-28" : "h-40";

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        data-dragging={dragging}
        onClick={() => !busy && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        className={`cms-drop relative flex cursor-pointer items-center gap-4 overflow-hidden p-2 outline-none focus-visible:border-[var(--cms-accent)] ${previewHeight}`}
      >
        <div className="relative h-full w-28 shrink-0 overflow-hidden rounded-md bg-[var(--cms-sunken)]">
          {value ? (
            kind === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element -- S3 or /public URLs
              <img src={value} alt="" className="h-full w-full object-cover" />
            ) : (
              <video src={value} muted loop autoPlay playsInline className="h-full w-full object-cover" />
            )
          ) : (
            <div className="grid h-full place-items-center text-[22px] text-[var(--cms-muted)]">
              {kind === "image" ? "◫" : "▶"}
            </div>
          )}
          {busy && (
            <div className="absolute inset-0 grid place-items-center bg-white/75 text-[12px] font-semibold text-[var(--cms-accent-ink)]">
              Uploading…
            </div>
          )}
        </div>
        <div className="min-w-0 pr-2">
          <p className="font-semibold text-[var(--cms-ink)]">
            {value ? `Replace ${kind}` : `Add ${kind === "image" ? "an image" : "a video"}`}
          </p>
          <p className="cms-help mt-0.5">Drop a file here or click to browse</p>
          {value && <p className="cms-help mt-1 truncate font-mono text-[11px]">{value}</p>}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1">
        <button type="button" className="cms-btn cms-btn-ghost cms-btn-sm" onClick={() => setLibrary(true)}>
          Choose from library
        </button>
        <button type="button" className="cms-btn cms-btn-ghost cms-btn-sm" onClick={() => setLinkMode((m) => !m)}>
          {linkMode ? "Hide link" : "Use a link"}
        </button>
        {value && (
          <button type="button" className="cms-btn cms-btn-danger cms-btn-sm" onClick={() => onChange("")}>
            Remove
          </button>
        )}
      </div>

      {linkMode && (
        <input
          className="cms-input mt-2"
          placeholder={kind === "image" ? "https://… or /images/…" : "https://… or /videos/…"}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {error && <p className="mt-2 text-[12.5px] text-[var(--cms-danger)]">{error}</p>}

      {library && (
        <LibraryPicker
          kind={kind}
          onClose={() => setLibrary(false)}
          onPick={(url) => {
            onChange(url);
            setLibrary(false);
          }}
        />
      )}
    </div>
  );
}
