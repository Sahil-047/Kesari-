"use client";

import {
  AppstoreOutlined,
  EditOutlined,
  ExportOutlined,
  PictureOutlined,
  SaveOutlined,
  SendOutlined,
  SkinOutlined,
} from "@ant-design/icons";
import { isWideField, SectionField } from "@/components/admin/ContentFields";
import { STUDIO } from "@/components/admin/AdminProviders";
import ScreenHeader, { ScreenBody } from "@/components/admin/ScreenHeader";
import StatusTag from "@/components/admin/StatusTag";
import { api } from "@/lib/api/client";
import { PAGE_DEFS, type PageDef, type SectionDef } from "@/lib/admin/pageDefinitions";
import { mergeContent, PAGE_DEFAULTS, type PageSlug } from "@/lib/content/pages";
import {
  Affix,
  Alert,
  App,
  Button,
  Card,
  Col,
  Drawer,
  Empty,
  Flex,
  Form,
  Row,
  Space,
  Spin,
  Tabs,
  Typography,
} from "antd";
import { useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useMemo, useState } from "react";
import { revalidatePage } from "./actions";

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

const FIRST_SLUG = PAGE_DEFS[0]!.slug;

function timeAgo(iso: string | null) {
  if (!iso) return "not yet";
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function statusInfo(loaded: Loaded | undefined) {
  if (!loaded) return { tone: "muted" as const, text: "Loading", hint: "Opening this page…" };
  if (loaded.dirty) {
    return {
      tone: "outline" as const,
      text: "Unsaved",
      hint: "Edits on this page are only on your screen. Save a draft, then publish to go live.",
    };
  }
  if (loaded.server.hasUnpublishedChanges) {
    return {
      tone: "soft" as const,
      text: "Draft ready",
      hint: "Saved. Publish when this page should update on the website.",
    };
  }
  if (loaded.server.publishedAt) {
    return {
      tone: "solid" as const,
      text: "Live",
      hint: `Live on the site · last published ${timeAgo(loaded.server.publishedAt)}.`,
    };
  }
  return {
    tone: "muted" as const,
    text: "Defaults",
    hint: "Using built-in copy until you publish this page.",
  };
}

/** First image/video poster in a section — for the module card thumbnail. */
function moduleThumb(section: SectionDef, data: Section | undefined): string | undefined {
  if (!data) return undefined;
  for (const f of section.fields) {
    if (f.type === "image" || f.type === "video") {
      const v = data[f.name];
      if (typeof v === "string" && v) return f.type === "video" ? undefined : v;
    }
    if (f.type === "image" && f.name === "poster") {
      const v = data.poster;
      if (typeof v === "string" && v) return v;
    }
  }
  const poster = data.poster;
  if (typeof poster === "string" && poster) return poster;
  const image = data.image;
  if (typeof image === "string" && image) return image;
  const items = data.items;
  if (Array.isArray(items)) {
    for (const item of items) {
      if (!item || typeof item !== "object") continue;
      const row = item as { image?: string; images?: string[] };
      if (typeof row.image === "string" && row.image) return row.image;
      if (Array.isArray(row.images) && typeof row.images[0] === "string" && row.images[0]) return row.images[0];
    }
  }
  return undefined;
}

function moduleMeta(section: SectionDef, data: Section | undefined): string {
  const itemsField = section.fields.find((f) => f.type === "repeater");
  if (itemsField && Array.isArray(data?.[itemsField.name])) {
    const n = (data![itemsField.name] as unknown[]).length;
    return n === 0 ? "Empty — add pieces" : `${n} item${n === 1 ? "" : "s"}`;
  }
  if (section.fields.some((f) => f.type === "link")) return "Links into the catalogue";
  if (section.fields.some((f) => f.type === "video" || f.type === "image")) return "Media + copy";
  return "Copy";
}

/**
 * Merchandising console: pick a page → open a module → fill from catalogue →
 * save draft → publish. Same page APIs; clearer Amazon/Flipkart-style flow.
 */
export default function WebsiteContentPage() {
  const { message } = App.useApp();
  const router = useRouter();
  const [pageSlug, setPageSlug] = useState<PageSlug>(FIRST_SLUG);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [pages, setPages] = useState<Partial<Record<PageSlug, Loaded>>>({});
  const [busy, setBusy] = useState<"save" | "publish" | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [productTotal, setProductTotal] = useState<number | null>(null);

  const def = (PAGE_DEFS.find((p) => p.slug === pageSlug) ?? PAGE_DEFS[0]!) as PageDef;
  const loaded = pages[def.slug];
  const status = statusInfo(loaded);
  const editingSection = editingKey ? def.sections.find((s) => s.key === editingKey) : null;

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const [slug, section] = hash.split(".");
    const page = PAGE_DEFS.find((p) => p.slug === slug);
    if (page) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPageSlug(page.slug);
      if (section && page.sections.some((s) => s.key === section)) setEditingKey(section);
    }
  }, []);

  useEffect(() => {
    const hash = editingKey ? `${pageSlug}.${editingKey}` : pageSlug;
    window.history.replaceState(null, "", `#${hash}`);
  }, [pageSlug, editingKey]);

  useEffect(() => {
    let cancelled = false;
    api
      .list("/admin/products", { limit: 1 })
      .then((r) => !cancelled && setProductTotal(r.meta.total))
      .catch(() => !cancelled && setProductTotal(null));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (pages[def.slug]) return;
    let cancelled = false;
    setLoadError(null);
    api
      .get<EditorPage>(`/admin/pages/${def.slug}`)
      .then((server) => {
        if (cancelled) return;
        const saved = Object.keys(server.draft ?? {}).length ? server.draft : server.published;
        const defaults = PAGE_DEFAULTS[def.slug] as unknown as Content;
        setPages((p) => ({
          ...p,
          [def.slug]: { server, content: mergeContent(defaults, saved), dirty: false },
        }));
      })
      .catch((e) => !cancelled && setLoadError(e instanceof Error ? e.message : "Could not load"));
    return () => {
      cancelled = true;
    };
  }, [def.slug, pages]);

  // When Look chapters opens, pull in products that tick that page's placement.
  useEffect(() => {
    if (editingKey !== "chapters") return;
    if (def.slug !== "womenswear" && def.slug !== "menswear") return;
    const slug = def.slug;
    let cancelled = false;
    import("@/lib/admin/placedChapters")
      .then((mod) =>
        slug === "womenswear" ? mod.syncWomenswearChaptersFromProducts() : mod.syncMenswearChaptersFromProducts(),
      )
      .then((items) => {
        if (cancelled) return;
        setPages((p) => {
          const page = p[slug];
          if (!page || page.dirty) return p;
          const chapters = (page.content.chapters ?? {}) as Record<string, unknown>;
          const prev = JSON.stringify((chapters as { items?: unknown }).items ?? []);
          if (prev === JSON.stringify(items)) return p;
          return {
            ...p,
            [slug]: {
              ...page,
              content: { ...page.content, chapters: { ...chapters, items } },
            },
          };
        });
      })
      .catch(() => {
        /* curated list still editable */
      });
    return () => {
      cancelled = true;
    };
  }, [def.slug, editingKey]);

  const dirtyPages = useMemo(
    () => PAGE_DEFS.filter((p) => pages[p.slug]?.dirty).map((p) => p.title),
    [pages],
  );

  const setField = (sectionKey: string, name: string, value: unknown) => {
    setPages((p) => {
      const current = p[def.slug];
      if (!current) return p;
      const content = {
        ...current.content,
        [sectionKey]: { ...current.content[sectionKey], [name]: value },
      };
      return { ...p, [def.slug]: { ...current, content, dirty: true } };
    });
  };

  const save = async () => {
    const slug = def.slug;
    const current = pages[slug];
    if (!current) return false;
    setBusy("save");
    try {
      const server = await api.put<EditorPage>(`/admin/pages/${slug}`, { content: current.content });
      setPages((p) => ({ ...p, [slug]: { ...current, server, dirty: false } }));
      message.success(`Draft of ${def.title} saved`);
      return true;
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Could not save");
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
      try {
        await revalidatePage(def.slug);
      } catch {
        /* storefront cache refreshes on its own */
      }
      message.success(`${def.title} is live on the site`);
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Could not publish");
    } finally {
      setBusy(null);
    }
  };

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

  const canPublish =
    Boolean(loaded) &&
    busy === null &&
    (Boolean(loaded?.dirty) || Boolean(loaded?.server.hasUnpublishedChanges) || !loaded?.server.publishedAt);

  return (
    <>
      <ScreenHeader
        title="Website content"
        description="Pick a page, open a module, fill it from the catalogue, then publish."
        meta={<StatusTag tone={status.tone}>{status.text}</StatusTag>}
        actions={
          <Button icon={<ExportOutlined />} href={def.path} target="_blank">
            Preview site
          </Button>
        }
      />

      <ScreenBody>
        {productTotal === 0 && (
          <Alert
            type="info"
            showIcon
            title="Catalogue first"
            description="Add products before dressing rails like The Edit."
            action={
              <Button type="primary" icon={<SkinOutlined />} onClick={() => router.push("/admin/products")}>
                Catalogue
              </Button>
            }
            style={{ marginBottom: 16 }}
          />
        )}
        {loadError && <Alert type="error" showIcon title={loadError} style={{ marginBottom: 16 }} />}

        <Card size="small" styles={{ body: { paddingInline: 12, paddingBlock: 4 } }} style={{ marginBottom: 16 }}>
          <Tabs
            activeKey={def.slug}
            onChange={(key) => {
              setEditingKey(null);
              setPageSlug(key as PageSlug);
            }}
            size="large"
            tabBarStyle={{ marginBottom: 0 }}
            items={PAGE_DEFS.map((p) => ({
              key: p.slug,
              label: (
                <span>
                  {p.title}
                  {pages[p.slug]?.dirty ? " ·" : ""}
                </span>
              ),
            }))}
          />
        </Card>

        <Card
          size="small"
          style={{ marginBottom: 16, background: STUDIO.wash, borderColor: loaded?.dirty ? STUDIO.ink : STUDIO.hairline }}
          styles={{ body: { padding: "14px 18px" } }}
        >
          <Flex justify="space-between" align="flex-start" gap={12} wrap>
            <div>
              <Typography.Text strong style={{ fontSize: 15 }}>
                {def.title}
              </Typography.Text>
              <Typography.Paragraph type="secondary" style={{ margin: "2px 0 0", fontSize: 13 }}>
                {def.summary} · {def.path}
              </Typography.Paragraph>
              <Typography.Paragraph type="secondary" style={{ margin: "6px 0 0", fontSize: 13 }}>
                {status.hint}
              </Typography.Paragraph>
            </div>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {def.sections.length} module{def.sections.length === 1 ? "" : "s"}
            </Typography.Text>
          </Flex>
        </Card>

        {!loaded ? (
          <Flex justify="center" style={{ padding: 64 }}>
            <Spin description={`Loading ${def.title}…`}>
              <div style={{ width: 140, height: 48 }} />
            </Spin>
          </Flex>
        ) : def.sections.length === 0 ? (
          <Empty description="No modules on this page" />
        ) : (
          <Row gutter={[16, 16]}>
            {def.sections.map((section, i) => {
              const data = loaded.content[section.key];
              const thumb = moduleThumb(section, data);
              const meta = moduleMeta(section, data);
              return (
                <Col key={section.key} xs={24} sm={12} xl={8}>
                  <Card
                    hoverable
                    styles={{ body: { padding: 0 } }}
                    onClick={() => setEditingKey(section.key)}
                    style={{ overflow: "hidden", height: "100%", cursor: "pointer" }}
                  >
                    <div
                      style={{
                        height: 140,
                        background: STUDIO.wash,
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      {thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element -- CMS media URLs
                        <img src={thumb} alt="" className="studio-media-cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <Flex vertical align="center" justify="center" gap={6} style={{ height: "100%", color: STUDIO.faint }}>
                          <AppstoreOutlined style={{ fontSize: 28 }} />
                          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                            Module {String(i + 1).padStart(2, "0")}
                          </Typography.Text>
                        </Flex>
                      )}
                      <span style={{ position: "absolute", top: 10, left: 10 }}>
                        <StatusTag tone="soft">{String(i + 1).padStart(2, "0")}</StatusTag>
                      </span>
                    </div>
                    <div style={{ padding: "14px 16px 16px" }}>
                      <Flex justify="space-between" align="flex-start" gap={8}>
                        <div style={{ minWidth: 0 }}>
                          <Typography.Text strong style={{ fontSize: 15, display: "block" }}>
                            {section.title}
                          </Typography.Text>
                          <Typography.Paragraph
                            type="secondary"
                            ellipsis={{ rows: 2 }}
                            style={{ margin: "4px 0 8px", fontSize: 13, minHeight: 40 }}
                          >
                            {section.description}
                          </Typography.Paragraph>
                          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                            <PictureOutlined style={{ marginRight: 6 }} />
                            {meta}
                          </Typography.Text>
                        </div>
                      </Flex>
                      <Button
                        type="primary"
                        block
                        icon={<EditOutlined />}
                        style={{ marginTop: 14 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingKey(section.key);
                        }}
                      >
                        Edit module
                      </Button>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </ScreenBody>

      <Drawer
        title={
          editingSection ? (
            <span>
              {def.title}
              <Typography.Text type="secondary" style={{ fontWeight: 400 }}>
                {" "}
                · {editingSection.title}
              </Typography.Text>
            </span>
          ) : (
            "Module"
          )
        }
        open={Boolean(editingSection && loaded)}
        onClose={() => setEditingKey(null)}
        size={720}
        destroyOnHidden
        extra={
          <Button type="link" icon={<ExportOutlined />} href={def.path} target="_blank">
            Preview
          </Button>
        }
        styles={{ body: { paddingBottom: 24 } }}
      >
        {editingSection && loaded && (
          <>
            <Alert
              type="info"
              showIcon={false}
              title={editingSection.description}
              style={{ marginBottom: 20, background: STUDIO.wash, borderColor: STUDIO.border }}
            />
            <Form layout="vertical" component="div" requiredMark={false}>
              <Row gutter={[16, 4]}>
                {editingSection.fields.map((f) => (
                  <Col key={f.name} xs={24} md={isWideField(f) ? 24 : 12}>
                    <SectionField
                      field={f}
                      value={loaded.content[editingSection.key]?.[f.name]}
                      onChange={(v) => setField(editingSection.key, f.name, v)}
                    />
                  </Col>
                ))}
              </Row>
            </Form>
            <Flex justify="end" gap={8} style={{ marginTop: 24 }}>
              <Button onClick={() => setEditingKey(null)}>Done</Button>
              <Button type="primary" icon={<SaveOutlined />} disabled={!loaded.dirty || busy !== null} loading={busy === "save"} onClick={save}>
                Save draft
              </Button>
            </Flex>
          </>
        )}
      </Drawer>

      <Affix offsetBottom={0}>
        <div
          style={{
            background: "rgba(255, 255, 255, 0.92)",
            backdropFilter: "saturate(180%) blur(12px)",
            borderTop: `1px solid ${STUDIO.border}`,
            padding: "12px 28px",
          }}
        >
          <Flex justify="space-between" align="center" wrap gap={12}>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {dirtyPages.length ? `Unsaved: ${dirtyPages.join(", ")}` : "Nothing waiting to save"} · Ctrl/Cmd + S
            </Typography.Text>
            <Space wrap>
              <Button icon={<SaveOutlined />} disabled={!loaded?.dirty || busy !== null} loading={busy === "save"} onClick={save}>
                Save draft
              </Button>
              <Button type="primary" icon={<SendOutlined />} loading={busy === "publish"} disabled={!canPublish} onClick={publish}>
                Publish {def.title}
              </Button>
            </Space>
          </Flex>
        </div>
      </Affix>
    </>
  );
}
