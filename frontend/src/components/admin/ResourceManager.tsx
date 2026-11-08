"use client";

import { DeleteOutlined, PlusOutlined, RightOutlined } from "@ant-design/icons";
import { api, ApiRequestError, type PageMeta } from "@/lib/api/client";
import type { Column, ResourceConfig } from "@/lib/admin/resources";
import {
  Alert,
  App,
  Button,
  Card,
  Col,
  Drawer,
  Empty,
  Flex,
  Form,
  Grid,
  Input,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Typography,
  type TableColumnsType,
} from "antd";
import { useCallback, useEffect, useState } from "react";
import { revalidateProducts } from "@/app/admin/content/actions";
import { STATUS_TONE } from "@/lib/admin/format";
import { STUDIO } from "./AdminProviders";
import FieldInput, { optionLabel } from "./FieldInput";
import StatusTag from "./StatusTag";
import ScreenHeader, { ScreenBody } from "./ScreenHeader";

type Row = { id: string } & Record<string, unknown>;

function getPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>(
    (acc, key) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[key] : undefined),
    obj,
  );
}


/** Logical product folder (products/soft-ivory); the API stores it under media/…. */
function mediaFolderFor(prefix: string | undefined, values: Record<string, unknown>): string | undefined {
  if (!prefix) return undefined;
  const raw = String(values.slug || values.name || "draft")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${prefix}/${raw || "draft"}`;
}

function fieldSections(fields: ResourceConfig["fields"]) {
  const sections: { title?: string; fields: ResourceConfig["fields"] }[] = [];
  const byTitle = new Map<string, (typeof sections)[number]>();
  for (const field of fields) {
    const title = field.section;
    const key = title ?? `__untitled-${sections.length}`;
    const existing = title ? byTitle.get(title) : undefined;
    if (existing) {
      existing.fields.push(field);
      continue;
    }
    const section = { title, fields: [field] };
    sections.push(section);
    if (title) byTitle.set(title, section);
    else byTitle.set(key, section);
  }
  return sections;
}

function renderCell(value: unknown, column: Column) {
  switch (column.format) {
    case "image":
      return typeof value === "string" && value ? (
        // eslint-disable-next-line @next/next/no-img-element -- S3 or /public URLs
        <img src={value} alt="" className="studio-thumb" />
      ) : (
        <div className="studio-thumb" />
      );
    case "price":
      return <Typography.Text strong>₹{Number(value ?? 0).toLocaleString("en-IN")}</Typography.Text>;
    case "date":
      return typeof value === "string"
        ? new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
        : "—";
    case "product":
      return (value as { name?: string } | null)?.name ?? <Typography.Text type="danger">Missing product</Typography.Text>;
    case "status": {
      const s = String(value ?? "");
      return <StatusTag tone={STATUS_TONE[s] ?? "soft"}>{optionLabel(s)}</StatusTag>;
    }
    default:
      if (typeof value === "boolean") return <StatusTag tone={value ? "solid" : "muted"}>{value ? "Yes" : "No"}</StatusTag>;
      if (Array.isArray(value)) {
        if (value.length === 0) return "—";
        return value
          .map((v) => String(v).split(".").pop() ?? String(v))
          .join(", ");
      }
      return String(value ?? "—");
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
    // Single-image fields store a URL string on products; the form keeps { url, alt }.
    if (field.type === "image") {
      if (value && typeof value === "object" && "url" in value) {
        value = (value as { url?: string }).url?.trim() || undefined;
      } else if (typeof value === "string") {
        value = value.trim() || undefined;
      }
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

const WIDE_TYPES = ["images", "image", "video", "textarea", "list"];

/** The save already succeeded; a failed cache refresh only delays the storefront by seconds. */
async function refreshStorefront(productId?: string) {
  try {
    await revalidateProducts(productId);
  } catch {
    /* storefront cache expires on its own */
  }
}

/** List + edit screen for one resource: Ant Table, filters, and a Drawer form. */
export default function ResourceManager({ config, description }: { config: ResourceConfig; description?: string }) {
  const { message } = App.useApp();
  const screens = Grid.useBreakpoint();
  const drawerWide = Boolean(screens.md);
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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount and when the query changes
    load();
  }, [load]);

  const open = useCallback(
    (row: Row | "new") => {
      setEditing(row);
      const next =
        row === "new" ? { ...config.defaults } : ({ ...row } as Record<string, unknown>);
      // Older products may predate sizeConfig — seed the form from defaults so save persists stock.
      // API stores single images as URL strings; the image field UI expects { url, alt }.
      for (const field of config.fields) {
        if (field.type === "sizeConfig" && next[field.name] == null && config.defaults[field.name] != null) {
          next[field.name] = config.defaults[field.name];
        }
        if (field.type === "image" && typeof next[field.name] === "string" && next[field.name]) {
          next[field.name] = { url: next[field.name] as string, alt: "" };
        }
      }
      setValues(next);
      setFieldErrors({});
      setFormError(null);
    },
    [config.defaults, config.fields],
  );

  // Dashboard shortcuts link here with ?new=1.
  useEffect(() => {
    if (config.canCreate && new URLSearchParams(window.location.search).get("new") === "1") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      open("new");
    }
  }, [config.canCreate, open]);

  const save = async () => {
    if (!editing) return;
    const isNew = editing === "new";
    setSaving(true);
    setFieldErrors({});
    setFormError(null);
    try {
      const payload = toPayload(config, values, isNew);
      // Always send placements (including []) so unticked surfaces clear on the API.
      if (config.fields.some((f) => f.name === "placements")) {
        payload.placements = Array.isArray(values.placements) ? values.placements : [];
      }
      const saved = isNew
        ? await api.post<{ id: string }>(base, payload)
        : await api.patch<{ id: string }>(`${base}/${editing.id}`, payload);
      if (config.revalidate === "products") {
        await refreshStorefront(saved?.id);
        try {
          const { syncPlacedChaptersFromProduct } = await import("@/lib/admin/placedChapters");
          await syncPlacedChaptersFromProduct({
            id: saved.id,
            placements: Array.isArray(payload.placements) ? (payload.placements as string[]) : [],
          });
        } catch {
          /* chapter sync is best-effort; storefront still merges by placement */
        }
      }
      const noun = config.singular.charAt(0).toUpperCase() + config.singular.slice(1);
      message.success(isNew ? `${noun} created` : "Changes saved");
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
    try {
      await api.delete(`${base}/${editing.id}`);
      if (config.revalidate === "products") await refreshStorefront(editing.id);
      message.success("Deleted");
      setEditing(null);
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not delete");
    }
  };

  const columns: TableColumnsType<Row> = [
    ...config.columns.map((c) => ({
      key: c.key,
      title: c.label,
      width: c.format === "image" ? 64 : undefined,
      render: (_: unknown, row: Row) => renderCell(getPath(row, c.key), c),
    })),
    { key: "open", width: 40, align: "right" as const, render: () => <RightOutlined style={{ color: STUDIO.faint, fontSize: 12 }} /> },
  ];

  const sections = fieldSections(config.fields);
  const uploadFolder = mediaFolderFor(config.mediaFolderPrefix, values);
  const isNew = editing === "new";
  const drawerTitle = isNew
    ? `New ${config.singular}`
    : editing
      ? String(editing.name ?? editing.title ?? `Edit ${config.singular}`)
      : "";

  return (
    <>
      <ScreenHeader
        title={config.title}
        description={description ?? (meta ? `${meta.total} in total` : undefined)}
        actions={
          config.canCreate && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => open("new")} block={!drawerWide}>
              New {config.singular}
            </Button>
          )
        }
      />

      <ScreenBody>
        <Card styles={{ body: { padding: 0 } }}>
          {(config.searchable || config.filters) && (
            <div className="studio-toolbar" style={{ padding: "12px 16px", borderBottom: `1px solid ${STUDIO.hairline}` }}>
              {config.searchable && (
                <Input.Search
                  allowClear
                  className="studio-toolbar-search"
                  placeholder={`Search ${config.title.toLowerCase()}…`}
                  style={{ maxWidth: drawerWide ? 280 : undefined }}
                  onSearch={(v) => {
                    setPage(1);
                    setSearch(v);
                  }}
                  onChange={(e) => {
                    if (!e.target.value) {
                      setPage(1);
                      setSearch("");
                    }
                  }}
                />
              )}
              {config.filters?.map((f) => (
                <Select
                  key={f.name}
                  allowClear
                  placeholder={`All ${f.label.toLowerCase()}`}
                  style={{ minWidth: drawerWide ? 160 : undefined }}
                  value={filters[f.name] || undefined}
                  onChange={(v) => {
                    setPage(1);
                    setFilters((prev) => ({ ...prev, [f.name]: v ?? "" }));
                  }}
                  options={f.options.map((o) => ({ value: o, label: optionLabel(o) }))}
                />
              ))}
            </div>
          )}

          {listError && <Alert type="error" showIcon title={listError} style={{ margin: 16 }} />}

          <Table<Row>
            rowKey="id"
            columns={columns}
            dataSource={rows}
            loading={loading}
            scroll={{ x: "max-content" }}
            onRow={(row) => ({ onClick: () => open(row), style: { cursor: "pointer" } })}
            locale={{
              emptyText: (
                <Empty description={`No ${config.title.toLowerCase()} yet`}>
                  {config.canCreate && (
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => open("new")}>
                      Add the first {config.singular}
                    </Button>
                  )}
                </Empty>
              ),
            }}
            pagination={
              meta && meta.pages > 1
                ? {
                    current: meta.page,
                    pageSize: meta.limit,
                    total: meta.total,
                    showSizeChanger: false,
                    onChange: setPage,
                  }
                : false
            }
          />
        </Card>
      </ScreenBody>

      <Drawer
        open={editing !== null}
        onClose={() => setEditing(null)}
        width={drawerWide ? 720 : "100%"}
        className="studio-form-drawer"
        title={drawerTitle}
        destroyOnHidden
        extra={drawerWide ? <Typography.Text type="secondary">{config.title}</Typography.Text> : undefined}
        styles={{ body: { background: STUDIO.subtle } }}
        footer={
          <Flex justify="space-between" align="center" gap={12} wrap>
            {!isNew ? (
              <Popconfirm
                title={`Delete this ${config.singular}?`}
                description="This cannot be undone."
                okText="Delete"
                okButtonProps={{ danger: true }}
                onConfirm={remove}
              >
                <Button danger icon={<DeleteOutlined />}>
                  Delete
                </Button>
              </Popconfirm>
            ) : (
              <span />
            )}
            <Space wrap>
              <Button onClick={() => setEditing(null)}>Cancel</Button>
              <Button type="primary" loading={saving} onClick={save}>
                {isNew ? `Create ${config.singular}` : "Save changes"}
              </Button>
            </Space>
          </Flex>
        }
      >
        {formError && <Alert type="error" showIcon title={formError} style={{ marginBottom: 16 }} />}
        <Form layout="vertical" component="div">
          <Flex vertical gap={16}>
            {sections.map((section, i) => (
              <Card
                key={section.title ? `section-${section.title}` : `section-${i}`}
                size="small"
                title={section.title}
                extra={
                  section.title === "Media" && uploadFolder ? (
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      media/{uploadFolder}
                    </Typography.Text>
                  ) : undefined
                }
              >
                <Row gutter={16}>
                  {section.fields.map((field) => (
                    <Col
                      key={field.name}
                      xs={24}
                      md={field.width === "half" ? 12 : field.width === "full" || WIDE_TYPES.includes(field.type) ? 24 : 12}
                    >
                      <Form.Item
                        label={field.label}
                        required={field.required}
                        extra={field.hint}
                        validateStatus={fieldErrors[field.name] ? "error" : undefined}
                        help={fieldErrors[field.name]}
                      >
                        <FieldInput
                          field={field}
                          value={values[field.name]}
                          uploadFolder={["images", "image", "video"].includes(field.type) ? uploadFolder : undefined}
                          onChange={(v) => setValues((prev) => ({ ...prev, [field.name]: v }))}
                        />
                      </Form.Item>
                    </Col>
                  ))}
                </Row>
              </Card>
            ))}
          </Flex>
        </Form>
      </Drawer>
    </>
  );
}
