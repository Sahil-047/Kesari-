"use client";

import { isWideField, SectionField } from "@/components/admin/ContentFields";
import Icon from "@/components/admin/Icon";
import { IsoStack } from "@/components/admin/Iso";
import ScreenHeader from "@/components/admin/ScreenHeader";
import { api } from "@/lib/api/client";
import { PAGE_DEFS, type PageDef } from "@/lib/admin/pageDefinitions";
import { mergeContent, PAGE_DEFAULTS, type PageSlug } from "@/lib/content/pages";
import { useEffect, useEffectEvent, useMemo, useState } from "react";

type Section = Record<string, unknown>;
type Content = Record<string, Section>;

type EditorPage = {
  draft: Content;
  published: Content | null;
  publishedAt: string | null;
  updatedAt: string | null;
  hasUnpublishedChanges: boolean;
};

type Loaded = { server: EditorPage; content: Content; dirty: boolean };

const FIRST = `${PAGE_DEFS[0]!.slug}.${PAGE_DEFS[0]!.sections[0]!.key}`;

function parseTarget(value: string): { def: PageDef; sectionKey: string } {
  const [slug, sectionKey] = value.split(".");
  const def = PAGE_DEFS.find((p) => p.slug === slug) ?? PAGE_DEFS[0]!;
  const section = def.sections.find((s) => s.key === sectionKey) ?? def.sections[0]!;
  return { def, sectionKey: section.key };
}

function timeAgo(iso: string | null) {
  if (!iso) return null;
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

/**
 * Website content: one form for the whole site. Pick a section from the
 * dropdown, edit its words, photos and films, then save or publish.
 */
export default function WebsiteContentPage() {
  const [target, setTarget] = useState(FIRST);
  const [pages, setPages] = useState<Partial<Record<PageSlug, Loaded>>>({});
  const [busy, setBusy] = useState<"save" | "publish" | null>(null);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  const { def, sectionKey } = parseTarget(target);
  const section = def.sections.find((s) => s.key === sectionKey)!;
  const loaded = pages[def.slug];

  // Remember the chosen section in the address bar (#whats-new.hero).
  useEffect(() => {
    const fromHash = window.location.hash.slice(1);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (fromHash) setTarget(parseTarget(fromHash).def.slug + "." + parseTarget(fromHash).sectionKey);
  }, []);

  useEffect(() => {
    window.history.replaceState(null, "", `#${target}`);
  }, [target]);

  // Load the page the first time one of its sections is opened.
  useEffect(() => {
    if (pages[def.slug]) return;
    let cancelled = false;
    api
      .get<EditorPage>(`/admin/pages/${def.slug}`)
      .then((server) => {
        if (cancelled) return;
        const saved = Object.keys(server.draft ?? {}).length ? server.draft : server.published;
        const defaults = PAGE_DEFAULTS[def.slug] as unknown as Content;
        setPages((p) => ({ ...p, [def.slug]: { server, content: mergeContent(defaults, saved), dirty: false } }));
      })
      .catch((e) => !cancelled && setMessage({ tone: "error", text: e instanceof Error ? e.message : "Could not load" }));
    return () => {
      cancelled = true;
    };
  }, [def.slug, pages]);

  const dirtyPages = useMemo(
    () => PAGE_DEFS.filter((p) => pages[p.slug]?.dirty).map((p) => p.title),
    [pages],
  );

  const setField = (name: string, value: unknown) => {
    setPages((p) => {
      const current = p[def.slug];
      if (!current) return p;
      const content = { ...current.content, [sectionKey]: { ...current.content[sectionKey], [name]: value } };
      return { ...p, [def.slug]: { ...current, content, dirty: true } };
    });
    setMessage(null);
  };

  const slug = def.slug;
  const pageTitle = def.title;

  const save = async () => {
    const current = pages[slug];
    if (!current) return false;
    setBusy("save");
    try {
      const server = await api.put<EditorPage>(`/admin/pages/${slug}`, { content: current.content });
      setPages((p) => ({ ...p, [slug]: { ...current, server, dirty: false } }));
      setMessage({ tone: "ok", text: `Draft of ${pageTitle} saved` });
      return true;
    } catch (e) {
      setMessage({ tone: "error", text: e instanceof Error ? e.message : "Could not save" });
      return false;
    } finally {
      setBusy(null);
    }
  };

  const publish = async () => {
    if (loaded?.dirty && !(await save())) return;
    setBusy("publish");
    try {
      const server = await api.post<EditorPage>(`/admin/pages/${def.slug}/publish`);
      setPages((p) => (p[def.slug] ? { ...p, [def.slug]: { ...p[def.slug]!, server } } : p));
      setMessage({ tone: "ok", text: `${def.title} is live. The site updates within a few minutes.` });
    } catch (e) {
      setMessage({ tone: "error", text: e instanceof Error ? e.message : "Could not publish" });
    } finally {
      setBusy(null);
    }
  };

  // Ctrl/Cmd + S saves; leaving with unsaved changes asks first.
  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      if (loaded?.dirty && !busy) save();
    }
  });
  const onLeave = useEffectEvent((e: BeforeUnloadEvent) => {
    if (dirtyPages.length) e.preventDefault();
  });
  useEffect(() => {
    window.addEventListener("keydown", onKey);
    window.addEventListener("beforeunload", onLeave);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("beforeunload", onLeave);
    };
  }, []);

  const server = loaded?.server;
  const status = loaded?.dirty
    ? { cls: "cms-chip-warning", text: "Unsaved" }
    : server?.hasUnpublishedChanges
      ? { cls: "cms-chip-accent", text: "Draft" }
      : server?.publishedAt
        ? { cls: "cms-chip-success", text: "Live" }
        : { cls: "", text: "Site default" };

  return (
    <div className="pb-28">
      <ScreenHeader
        title="Website content"
        description="One form for the whole site: choose a section, change it, publish."
      />

      <div className="mx-auto grid max-w-[1240px] gap-8 px-8 py-8 xl:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-6">
          {/* Step 1: where */}
          <section className="cms-card p-6">
            <p className="cms-eyebrow">Step 01 · Where on the site</p>
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <label className="min-w-[280px] flex-1">
                <span className="sr-only">Section to edit</span>
                <select className="cms-select h-12 text-[15px] font-semibold" value={target} onChange={(e) => setTarget(e.target.value)}>
                  {PAGE_DEFS.map((p) => (
                    <optgroup key={p.slug} label={p.title}>
                      {p.sections.map((s) => (
                        <option key={s.key} value={`${p.slug}.${s.key}`}>
                          {p.title} › {s.title}
                          {pages[p.slug]?.dirty ? "  •" : ""}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </label>
              <span className={`cms-chip ${status.cls}`}>{status.text}</span>
            </div>
            <p className="mt-3 text-[var(--cms-muted)]">{section.description}</p>
          </section>

          {/* Step 2: what */}
          <section className="cms-card">
            <div className="flex items-center justify-between gap-4 border-b border-[var(--cms-line)] px-6 py-4">
              <div>
                <p className="cms-eyebrow">Step 02 · Content</p>
                <h2 className="cms-display mt-1 text-[20px]">
                  {def.title} › {section.title}
                </h2>
              </div>
              <a href={def.path} target="_blank" rel="noreferrer" className="cms-btn cms-btn-ghost cms-btn-sm">
                <Icon name="external" size={15} /> View on site
              </a>
            </div>

            {message && (
              <div
                role="status"
                className={`mx-6 mt-5 flex items-center gap-2 rounded-[4px] border px-4 py-3 font-semibold ${
                  message.tone === "ok"
                    ? "border-[var(--cms-success)] bg-[var(--cms-success-soft)] text-[var(--cms-success)]"
                    : "border-[var(--cms-danger)] bg-[var(--cms-danger-soft)] text-[var(--cms-danger)]"
                }`}
              >
                {message.tone === "ok" && <Icon name="check" size={16} />}
                {message.text}
              </div>
            )}

            {!loaded ? (
              <p className="px-6 py-12 text-center text-[var(--cms-muted)]">Loading {def.title}…</p>
            ) : (
              <div className="grid gap-5 p-6 md:grid-cols-2">
                {section.fields.map((f) => (
                  <div key={f.name} className={isWideField(f) ? "md:col-span-2" : ""}>
                    <SectionField field={f} value={loaded.content[sectionKey]?.[f.name]} onChange={(v) => setField(f.name, v)} />
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Where this section sits on its page */}
        <aside className="hidden xl:block">
          <div className="cms-card sticky top-28 p-5">
            <p className="cms-eyebrow">Page map</p>
            <p className="cms-display mt-1 text-[18px]">{def.title}</p>
            <p className="cms-mono text-[11px] text-[var(--cms-muted)]">{def.path}</p>
            <IsoStack
              layers={def.sections.map((s) => ({ key: s.key, label: s.title }))}
              active={sectionKey}
              onSelect={(key) => setTarget(`${def.slug}.${key}`)}
            />
            <dl className="cms-mono space-y-1 border-t border-[var(--cms-border)] pt-3 text-[11px] text-[var(--cms-muted)]">
              <div className="flex justify-between">
                <dt>Saved</dt>
                <dd>{timeAgo(server?.updatedAt ?? null) ?? "never"}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Published</dt>
                <dd>{timeAgo(server?.publishedAt ?? null) ?? "not yet"}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>

      {/* Action bar */}
      <div className="fixed bottom-0 left-[252px] right-0 z-40 border-t border-[var(--cms-line)] bg-[var(--cms-surface)]">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-3 px-8 py-3">
          <p className="cms-mono text-[11px] uppercase tracking-[0.08em] text-[var(--cms-muted)]">
            {dirtyPages.length ? `Unsaved: ${dirtyPages.join(", ")}` : "All changes saved"} · Ctrl + S saves
          </p>
          <div className="flex items-center gap-2">
            <button type="button" className="cms-btn" disabled={!loaded?.dirty || busy !== null} onClick={save}>
              {busy === "save" ? "Saving…" : "Save draft"}
            </button>
            <button
              type="button"
              className="cms-btn cms-btn-primary"
              disabled={!loaded || busy !== null || (!loaded.dirty && !server?.hasUnpublishedChanges && Boolean(server?.publishedAt))}
              onClick={publish}
            >
              {busy === "publish" ? "Publishing…" : `Publish ${def.title}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
