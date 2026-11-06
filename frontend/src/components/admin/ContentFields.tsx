"use client";

import {
  ArrowDownOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  FolderOpenOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { api } from "@/lib/api/client";
import type { PageFieldDef, RepeaterField, SimpleField } from "@/lib/admin/pageDefinitions";
import {
  Avatar,
  Button,
  Card,
  Col,
  Collapse,
  Empty,
  Flex,
  Form,
  Input,
  Popconfirm,
  Row,
  Select,
  Space,
  Typography,
  Upload,
} from "antd";
import { useEffect, useState } from "react";
import ImageCropModal from "./ImageCropModal";
import MediaDrop, { LibraryPicker, uploadToLibrary } from "./MediaDrop";

type ItemValue = string | string[];
type Item = Record<string, ItemValue>;

/** Several photos for a chapter rail — reorder, crop-upload, remove. */
function ImagesInput({
  value,
  onChange,
  max = 8,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
}) {
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [queue, setQueue] = useState<File[]>([]);
  const [library, setLibrary] = useState(false);
  const [crop, setCrop] = useState<{ preview: string; fileName: string; replace?: number } | null>(null);

  const canAdd = value.length < max;

  useEffect(() => {
    if (crop || queue.length === 0) return;
    const [next, ...rest] = queue;
    if (!next) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- open crop for next queued file
    setCrop({ preview: URL.createObjectURL(next), fileName: next.name });
    setQueue(rest);
  }, [crop, queue]);

  useEffect(() => {
    return () => {
      if (crop?.preview.startsWith("blob:")) URL.revokeObjectURL(crop.preview);
    };
  }, [crop]);

  const closeCrop = () => {
    if (crop?.preview.startsWith("blob:")) URL.revokeObjectURL(crop.preview);
    setCrop(null);
  };

  const onCropConfirm = async (file: File) => {
    if (!crop) return;
    setBusy((b) => b + 1);
    setError(null);
    try {
      const url = (await uploadToLibrary(file, "pages/womenswear")).url;
      if (typeof crop.replace === "number") {
        onChange(value.map((u, i) => (i === crop.replace ? url : u)));
      } else {
        onChange([...value, url].slice(0, max));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy((b) => Math.max(0, b - 1));
      closeCrop();
    }
  };

  const move = (i: number, dir: -1 | 1) => {
    const t = i + dir;
    if (t < 0 || t >= value.length) return;
    const next = [...value];
    [next[i], next[t]] = [next[t]!, next[i]!];
    onChange(next);
  };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(112px, 1fr))", gap: 10 }}>
        {value.map((url, i) => (
          <Card
            key={`${url}-${i}`}
            size="small"
            cover={
              <div style={{ position: "relative" }}>
                {/* eslint-disable-next-line @next/next/no-img-element -- CMS media URLs */}
                <img src={url} alt="" className="studio-media-cover" />
                {i === 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: 6,
                      left: 6,
                      background: "rgba(0,0,0,0.65)",
                      color: "#fff",
                      fontSize: 10,
                      padding: "2px 6px",
                      borderRadius: 4,
                    }}
                  >
                    Cover
                  </span>
                )}
              </div>
            }
            actions={[
              <ArrowLeftOutlined key="l" aria-label="Move left" onClick={() => move(i, -1)} />,
              <ArrowRightOutlined key="r" aria-label="Move right" onClick={() => move(i, 1)} />,
              <DeleteOutlined key="d" aria-label="Remove" onClick={() => onChange(value.filter((_, j) => j !== i))} />,
            ]}
            styles={{ body: { display: "none" } }}
          />
        ))}
        {canAdd && (
          <Upload.Dragger
            accept="image/*"
            multiple
            showUploadList={false}
            disabled={busy > 0}
            beforeUpload={(file, fileList) => {
              if (file === fileList[0]) {
                const list = fileList.filter((f) => f.type.startsWith("image/"));
                const room = max - value.length;
                if (list.length) setQueue((q) => [...q, ...list.slice(0, room)]);
              }
              return false;
            }}
            style={{ minHeight: 140 }}
          >
            <p style={{ margin: 0, fontSize: 12 }}>{busy ? "Uploading…" : "Add photos"}</p>
          </Upload.Dragger>
        )}
      </div>
      <Space size={4} style={{ marginTop: 8 }} wrap>
        <Button
          size="small"
          icon={<FolderOpenOutlined />}
          disabled={!canAdd || busy > 0}
          onClick={() => setLibrary(true)}
        >
          Choose from library
        </Button>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {value.length}/{max} photos
        </Typography.Text>
      </Space>
      {error && (
        <Typography.Text type="danger" style={{ fontSize: 12, display: "block", marginTop: 6 }}>
          {error}
        </Typography.Text>
      )}
      <LibraryPicker
        kind="image"
        open={library}
        onClose={() => setLibrary(false)}
        onPick={(m) => {
          if (!canAdd) return;
          if (value.includes(m.url)) {
            setError("That photo is already in this chapter.");
            setLibrary(false);
            return;
          }
          onChange([...value, m.url].slice(0, max));
          setError(null);
          setLibrary(false);
        }}
      />
      {crop && (
        <ImageCropModal open src={crop.preview} fileName={crop.fileName} onCancel={closeCrop} onConfirm={onCropConfirm} />
      )}
    </div>
  );
}

/** Inputs for website-content fields: text, long text, link, image(s), video, select. */
function SimpleInput({
  field,
  value,
  onChange,
}: {
  field: SimpleField;
  value: ItemValue;
  onChange: (v: ItemValue) => void;
}) {
  if (field.type === "images") {
    return (
      <ImagesInput
        value={Array.isArray(value) ? value.filter((u): u is string => typeof u === "string") : []}
        onChange={onChange}
        max={field.max}
      />
    );
  }
  if (field.type === "image" || field.type === "video") {
    return <MediaDrop kind={field.type} value={typeof value === "string" ? value : ""} onChange={onChange} />;
  }
  if (field.type === "textarea") {
    return (
      <Input.TextArea
        autoSize={{ minRows: 3, maxRows: 10 }}
        value={typeof value === "string" ? value : ""}
        placeholder={field.placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  if (field.type === "link") {
    return (
      <LinkInput
        value={typeof value === "string" ? value : ""}
        placeholder={field.placeholder}
        onChange={onChange}
      />
    );
  }
  if (field.type === "select") {
    return (
      <Select
        allowClear
        style={{ width: "100%" }}
        placeholder={field.placeholder ?? "Choose…"}
        value={typeof value === "string" && value ? value : undefined}
        onChange={(v: string | undefined) => onChange(v ?? "")}
        options={field.options}
      />
    );
  }
  return (
    <Input
      value={typeof value === "string" ? value : ""}
      placeholder={field.placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

/** Product page links are stored as /product/<id> (see lib/productLinks.ts). */
const productIdFromHref = (href: string) => /^\/product\/([a-f0-9]{24})\/?$/i.exec(href)?.[1];

type ProductOption = { id: string; name: string; category: string; status: string };

// One product list per CMS session; every link field shares it.
let productOptions: Promise<ProductOption[]> | null = null;
function loadProductOptions() {
  productOptions ??= api
    .list<ProductOption>("/admin/products", { limit: 100 })
    .then((r) => r.items)
    .catch(() => {
      productOptions = null;
      return [];
    });
  return productOptions;
}

/**
 * A link: pick a catalogue piece (stored as /product/<id> under the hood —
 * the id is never shown) or type any other path / URL.
 */
function LinkInput({
  value,
  placeholder,
  onChange,
}: {
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
}) {
  const [products, setProducts] = useState<ProductOption[] | null>(null);
  const [customMode, setCustomMode] = useState(false);

  useEffect(() => {
    let alive = true;
    loadProductOptions().then((list) => alive && setProducts(list));
    return () => {
      alive = false;
    };
  }, []);

  const linkedId = productIdFromHref(value);
  const linked = products?.find((p) => p.id === linkedId);
  const isProductLink = Boolean(linkedId);
  // Free-text field only for non-product paths (never show /product/<objectId>).
  const showCustom = customMode || (Boolean(value) && !isProductLink);

  useEffect(() => {
    if (isProductLink) setCustomMode(false);
  }, [isProductLink]);

  return (
    <Flex vertical gap={6}>
      <Select
        showSearch
        allowClear
        aria-label="Link to a product"
        placeholder="Choose a product…"
        loading={products === null}
        optionFilterProp="label"
        style={{ width: "100%" }}
        value={linkedId ?? null}
        onChange={(id: string | undefined) => {
          setCustomMode(false);
          onChange(id ? `/product/${id}` : "");
        }}
        options={(products ?? []).map((p) => ({
          value: p.id,
          label: p.name,
          title: `${p.name} · ${p.category}${p.status === "active" ? "" : " (inactive)"}`,
        }))}
        optionRender={(opt) => {
          const p = products?.find((x) => x.id === opt.value);
          return (
            <Flex justify="space-between" gap={8}>
              <span>{p?.name}</span>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {p?.status === "active" ? p.category : "inactive"}
              </Typography.Text>
            </Flex>
          );
        }}
      />

      {showCustom ? (
        <Input
          value={isProductLink ? "" : value}
          aria-label="Link address"
          placeholder={placeholder ?? "/whats-new or https://…"}
          onChange={(e) => {
            setCustomMode(true);
            onChange(e.target.value);
          }}
        />
      ) : (
        <Button
          type="link"
          size="small"
          style={{ paddingInline: 0, height: "auto", alignSelf: "flex-start" }}
          onClick={() => setCustomMode(true)}
        >
          Or use a custom path…
        </Button>
      )}

      {linkedId && (
        <Typography.Text type={linked && linked.status !== "active" ? "warning" : "secondary"} style={{ fontSize: 12 }}>
          {linked
            ? linked.status === "active"
              ? `Opens ${linked.name} on the site.`
              : `${linked.name} is inactive — make it active before publishing.`
            : products
              ? "This product no longer exists. Choose another piece."
              : "Opens a product page."}
        </Typography.Text>
      )}
    </Flex>
  );
}

// Links and galleries get the full row so pickers and photo grids have room.
const isWide = (type: string) => ["repeater", "image", "images", "video", "textarea", "link"].includes(type);

function itemThumb(item: Item, field: RepeaterField): string | undefined {
  const single = field.fields.find((f) => f.type === "image");
  if (single) {
    const v = item[single.name];
    if (typeof v === "string" && v) return v;
  }
  const gallery = field.fields.find((f) => f.type === "images");
  if (gallery) {
    const v = item[gallery.name];
    if (Array.isArray(v) && typeof v[0] === "string") return v[0];
  }
  return undefined;
}

/** A list of items (pieces, moments, steps…) that can be added, edited, reordered and removed. */
function Repeater({ field, items, onChange }: { field: RepeaterField; items: Item[]; onChange: (items: Item[]) => void }) {
  const [open, setOpen] = useState<string[]>([]);

  const update = (i: number, name: string, v: ItemValue) =>
    onChange(items.map((it, j) => (j === i ? { ...it, [name]: v } : it)));
  const move = (i: number, dir: -1 | 1) => {
    const t = i + dir;
    if (t < 0 || t >= items.length) return;
    const next = [...items];
    [next[i], next[t]] = [next[t]!, next[i]!];
    onChange(next);
    setOpen((o) => o.map((k) => (k === String(i) ? String(t) : k === String(t) ? String(i) : k)));
  };

  return (
    <Flex vertical gap={8}>
      {items.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Nothing here yet" />
      ) : (
        <Collapse
          activeKey={open}
          onChange={(keys) => setOpen(keys as string[])}
          items={items.map((item, i) => {
            const thumb = itemThumb(item, field);
            const title = item[field.titleField];
            return {
              key: String(i),
              label: (
                <Flex align="center" gap={12}>
                  <Typography.Text type="secondary" style={{ width: 22 }}>
                    {String(i + 1).padStart(2, "0")}
                  </Typography.Text>
                  {thumb && <Avatar shape="square" size={36} src={thumb} />}
                  <Typography.Text strong ellipsis>
                    {typeof title === "string" && title ? (
                      title
                    ) : (
                      <Typography.Text type="secondary">Untitled</Typography.Text>
                    )}
                  </Typography.Text>
                </Flex>
              ),
              extra: (
                <Flex gap={4} onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="small"
                    type="text"
                    aria-label="Move up"
                    icon={<ArrowUpOutlined />}
                    disabled={i === 0}
                    onClick={() => move(i, -1)}
                  />
                  <Button
                    size="small"
                    type="text"
                    aria-label="Move down"
                    icon={<ArrowDownOutlined />}
                    disabled={i === items.length - 1}
                    onClick={() => move(i, 1)}
                  />
                  <Popconfirm
                    title="Remove this item?"
                    okText="Remove"
                    okButtonProps={{ danger: true }}
                    onConfirm={() => {
                      onChange(items.filter((_, j) => j !== i));
                      setOpen([]);
                    }}
                  >
                    <Button size="small" type="text" danger aria-label="Remove" icon={<DeleteOutlined />} />
                  </Popconfirm>
                </Flex>
              ),
              children: (
                <Row gutter={16}>
                  {field.fields.map((f) => (
                    <Col key={f.name} xs={24} md={isWide(f.type) ? 24 : 12}>
                      <Form.Item label={f.label} extra={f.help}>
                        <SimpleInput
                          field={f}
                          value={item[f.name] ?? (f.type === "images" ? [] : "")}
                          onChange={(v) => update(i, f.name, v)}
                        />
                      </Form.Item>
                    </Col>
                  ))}
                </Row>
              ),
            };
          })}
        />
      )}

      {(!field.max || items.length < field.max) && (
        <Button
          type="dashed"
          block
          icon={<PlusOutlined />}
          onClick={() => {
            onChange([
              ...items,
              Object.fromEntries(field.fields.map((f) => [f.name, f.type === "images" ? [] : ""])),
            ]);
            setOpen([String(items.length)]);
          }}
        >
          {field.addLabel}
        </Button>
      )}
    </Flex>
  );
}

/** One field of a website section, whatever its type, wrapped in an Ant Form.Item. */
export function SectionField({
  field,
  value,
  onChange,
}: {
  field: PageFieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  return (
    <Form.Item label={field.label} extra={"help" in field ? field.help : undefined}>
      {field.type === "repeater" ? (
        <Repeater field={field} items={Array.isArray(value) ? (value as Item[]) : []} onChange={onChange} />
      ) : (
        <SimpleInput
          field={field}
          value={
            field.type === "images"
              ? Array.isArray(value)
                ? (value as string[])
                : []
              : typeof value === "string"
                ? value
                : ""
          }
          onChange={onChange}
        />
      )}
    </Form.Item>
  );
}

/** Fields that need the full row width. */
export function isWideField(field: PageFieldDef): boolean {
  return isWide(field.type);
}
