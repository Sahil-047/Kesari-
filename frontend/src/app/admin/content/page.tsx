"use client";

import { ExportOutlined, SaveOutlined, SendOutlined, SkinOutlined } from "@ant-design/icons";
import { isWideField, SectionField } from "@/components/admin/ContentFields";
import { STUDIO } from "@/components/admin/AdminProviders";
import ScreenHeader, { ScreenBody } from "@/components/admin/ScreenHeader";
import StatusTag from "@/components/admin/StatusTag";
import { api } from "@/lib/api/client";
import { PAGE_DEFS, type PageDef } from "@/lib/admin/pageDefinitions";
import { mergeContent, PAGE_DEFAULTS, type PageSlug } from "@/lib/content/pages";
import {
  Affix,
  Alert,
  App,
  Button,
  Card,
  Col,
  Divider,
  Flex,
  Form,
  Row,
  Space,
  Spin,
  Tabs,
  Typography,
} from "antd";
import { useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
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
  if (!iso) return "—";
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function statusInfo(loaded: Loaded | undefined) {
  if (!loaded) return { tone: "muted" as const, text: "…" };
  if (loaded.dirty) return { tone: "outline" as const, text: "Unsaved" };
  if (loaded.server.hasUnpublishedChanges) return { tone: "soft" as const, text: "Draft" };
  if (loaded.server.publishedAt) return { tone: "solid" as const, text: "Live" };
  return { tone: "muted" as const, text: "Default" };
}

/** Edit page copy and media: pick a tab, edit, save, publish. */
export default function WebsiteContentPage() {
  const { message } = App.useApp();
  const router = useRouter();
  const [pageSlug, setPageSlug] = useState<PageSlug>(FIRST_SLUG);
  const [pages, setPages] = useState<Partial<Record<PageSlug, Loaded>>>({});
  const [busy, setBusy] = useState<"save" | "publish" | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [productTotal, setProductTotal] = useState<number | null>(null);

  const def = (PAGE_DEFS.find((p) => p.slug === pageSlug) ?? PAGE_DEFS[0]!) as PageDef;
  const loaded = pages[def.slug];
  const status = statusInfo(loaded);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const slug = hash.split(".")[0];
    const page = PAGE_DEFS.find((p) => p.slug === slug);
    if (page) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPageSlug(page.slug);
    }
  }, []);

  useEffect(() => {
    window.history.replaceState(null, "", `#${pageSlug}`);
  }, [pageSlug]);

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

  const chaptersSynced = useRef<PageSlug | null>(null);
  useEffect(() => {
    chaptersSynced.current = null;
  }, [def.slug]);
  useEffect(() => {
    if (def.slug !== "womenswear" && def.slug !== "menswear") return;
    const page = pages[def.slug];
    if (!page || page.dirty || chaptersSynced.current === def.slug) return;
    const slug = def.slug;
    let cancelled = false;
    chaptersSynced.current = slug;
    import("@/lib/admin/placedChapters")
      .then((mod) =>
        slug === "womenswear" ? mod.syncWomenswearChaptersFromProducts() : mod.syncMenswearChaptersFromProducts(),
      )
      .then((items) => {
        if (cancelled) return;
        setPages((p) => {
          const current = p[slug];
          if (!current || current.dirty) return p;
          const chapters = (current.content.chapters ?? {}) as Record<string, unknown>;
          const prev = JSON.stringify((chapters as { items?: unknown }).items ?? []);
          if (prev === JSON.stringify(items)) return p;
          return {
            ...p,
            [slug]: {
              ...current,
              content: { ...current.content, chapters: { ...chapters, items } },
            },
          };
        });
      })
      .catch(() => {
        /* still editable */
      });
    return () => {
      cancelled = true;
    };
  }, [def.slug, pages]);

  const dirtyPages = useMemo(
    () => PAGE_DEFS.filter((p) => pages[p.slug]?.dirty).map((p) => p.title),
    [pages],
  );

  const setField = (sectionKey: string, name: string, value: unknown) => {
    setPages((p) => {
      const current = p[def.slug];
      if (!current) return p;
      return {
        ...p,
        [def.slug]: {
          ...current,
          dirty: true,
          content: {
            ...current.content,
            [sectionKey]: { ...current.content[sectionKey], [name]: value },
          },
        },
      };
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
      message.success("Draft saved");
      return true;
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Save failed");
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
        /* cache refreshes on its own */
      }
      message.success("Published");
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Publish failed");
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

  const publishedLabel = loaded?.server.publishedAt ? timeAgo(loaded.server.publishedAt) : null;

  return (
    <>
      <ScreenHeader
        title="Pages"
        description="Edit · save · publish"
        meta={<StatusTag tone={status.tone}>{status.text}</StatusTag>}
        actions={
          <Button icon={<ExportOutlined />} href={def.path} target="_blank">
            View
          </Button>
        }
      />

      <ScreenBody>
        {productTotal === 0 && (
          <Alert
            type="info"
            showIcon
            title="No products yet"
            description="Add products before linking them here."
            action={
              <Button size="small" type="primary" icon={<SkinOutlined />} onClick={() => router.push("/admin/products")}>
                Products
              </Button>
            }
            style={{ marginBottom: 16 }}
          />
        )}
        {loadError && <Alert type="error" showIcon title={loadError} style={{ marginBottom: 16 }} />}

        <Tabs
          activeKey={def.slug}
          onChange={(key) => setPageSlug(key as PageSlug)}
          type="card"
          size="middle"
          style={{ marginBottom: 0 }}
          tabBarStyle={{ marginBottom: 0 }}
          items={PAGE_DEFS.map((p) => ({
            key: p.slug,
            label: pages[p.slug]?.dirty ? `${p.title} ·` : p.title,
          }))}
        />

        {!loaded ? (
          <Flex justify="center" style={{ padding: 56 }}>
            <Spin />
          </Flex>
        ) : (
          <Card
            size="small"
            style={{ borderTopLeftRadius: 0, borderTop: `1px solid ${STUDIO.border}` }}
            styles={{ body: { padding: "20px 20px 8px" } }}
            title={
              <Flex align="baseline" justify="space-between" gap={12} wrap>
                <Flex align="baseline" gap={10} wrap>
                  <Typography.Text strong style={{ fontSize: 15 }}>
                    {def.title}
                  </Typography.Text>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {def.summary}
                    {def.path !== "/" ? ` · ${def.path}` : ""}
                  </Typography.Text>
                </Flex>
                {publishedLabel && (
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    Published {publishedLabel}
                  </Typography.Text>
                )}
              </Flex>
            }
          >
            <Form layout="vertical" component="div" requiredMark={false} size="middle">
              {def.sections.map((section, index) => (
                <div key={section.key}>
                  {index > 0 && <Divider style={{ margin: "8px 0 20px" }} />}
                  <Typography.Text
                    strong
                    style={{
                      display: "block",
                      marginBottom: section.description ? 2 : 14,
                      fontSize: 12,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: STUDIO.muted,
                    }}
                  >
                    {section.title}
                  </Typography.Text>
                  {section.description ? (
                    <Typography.Paragraph type="secondary" style={{ marginBottom: 14, fontSize: 12 }}>
                      {section.description}
                    </Typography.Paragraph>
                  ) : null}
                  <Row gutter={[16, 0]}>
                    {section.fields.map((f) => (
                      <Col key={f.name} xs={24} md={isWideField(f) ? 24 : 12}>
                        <SectionField
                          field={f}
                          value={loaded.content[section.key]?.[f.name]}
                          onChange={(v) => setField(section.key, f.name, v)}
                        />
                      </Col>
                    ))}
                  </Row>
                </div>
              ))}
            </Form>
          </Card>
        )}
      </ScreenBody>

      <Affix offsetBottom={0}>
        <div className="studio-affix-bar" style={{ padding: "12px 28px" }}>
          <Flex justify="space-between" align="center" wrap gap={12}>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {dirtyPages.length ? `Unsaved · ${dirtyPages.join(", ")}` : "All saved"}
            </Typography.Text>
            <Space>
              <Button size="middle" icon={<SaveOutlined />} disabled={!loaded?.dirty || busy !== null} loading={busy === "save"} onClick={save}>
                Save
              </Button>
              <Button size="middle" type="primary" icon={<SendOutlined />} loading={busy === "publish"} disabled={!canPublish} onClick={publish}>
                Publish
              </Button>
            </Space>
          </Flex>
        </div>
      </Affix>
    </>
  );
}
