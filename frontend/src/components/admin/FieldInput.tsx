"use client";

import { ArrowLeftOutlined, ArrowRightOutlined, DeleteOutlined, PlusOutlined, ScissorOutlined } from "@ant-design/icons";
import { api } from "@/lib/api/client";
import type { ApiImage, ApiProduct } from "@/lib/api/types";
import type { Field } from "@/lib/admin/resources";
import {
  Card,
  Checkbox,
  ColorPicker,
  DatePicker,
  Flex,
  Input,
  InputNumber,
  Select,
  Spin,
  Switch,
  Typography,
  Upload,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import ImageCropModal from "./ImageCropModal";
import MediaDrop, { uploadToLibrary } from "./MediaDrop";
import StatusTag from "./StatusTag";

type Props = {
  field: Field;
  value: unknown;
  onChange: (value: unknown) => void;
  /** S3 folder for uploads from this field (e.g. products/soft-ivory). */
  uploadFolder?: string;
};

const OPTION_LABELS: Record<string, string> = {
  buy_now: "Buy now",
  contact_whatsapp: "Contact us (WhatsApp)",
  draft: "Draft",
  published: "Published",
  active: "Active",
  inactive: "Inactive",
};

export function optionLabel(value: string) {
  return OPTION_LABELS[value] ?? value.replaceAll("_", " ");
}

type CropJob =
  | { kind: "file"; file: File; preview: string }
  | { kind: "replace"; index: number; preview: string; fileName: string };

/** Several photos at once: crop each one, then upload; reorder, remove, edit alt. */
function ImageGallery({
  images,
  onChange,
  folder,
}: {
  images: ApiImage[];
  onChange: (v: ApiImage[]) => void;
  folder?: string;
}) {
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [queue, setQueue] = useState<File[]>([]);
  const [cropJob, setCropJob] = useState<CropJob | null>(null);

  // Advance the upload queue into the crop modal one file at a time.
  useEffect(() => {
    if (cropJob || queue.length === 0) return;
    const [next, ...rest] = queue;
    if (!next) return;
    const preview = URL.createObjectURL(next);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- open crop for the next queued file
    setCropJob({ kind: "file", file: next, preview });
    setQueue(rest);
  }, [cropJob, queue]);

  useEffect(() => {
    return () => {
      if (cropJob?.kind === "file") URL.revokeObjectURL(cropJob.preview);
    };
  }, [cropJob]);

  const closeCrop = () => {
    if (cropJob?.kind === "file") URL.revokeObjectURL(cropJob.preview);
    setCropJob(null);
  };

  const uploadCropped = async (file: File) => {
    setBusy((b) => b + 1);
    setError(null);
    try {
      const m = await uploadToLibrary(file, folder);
      return { url: m.url, key: m.key, alt: m.alt } satisfies ApiImage;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
      return null;
    } finally {
      setBusy((b) => Math.max(0, b - 1));
    }
  };

  const onCropConfirm = async (file: File) => {
    if (!cropJob) return;
    if (cropJob.kind === "file") {
      const added = await uploadCropped(file);
      if (added) onChange([...images, added]);
      URL.revokeObjectURL(cropJob.preview);
    } else {
      const replaced = await uploadCropped(file);
      if (replaced) {
        onChange(images.map((img, i) => (i === cropJob.index ? { ...replaced, alt: img.alt || replaced.alt } : img)));
      }
    }
    setCropJob(null);
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 12 }}>
        {images.map((img, i) => (
          <Card
            key={`${img.url}-${i}`}
            size="small"
            cover={
              <div style={{ position: "relative" }}>
                {/* eslint-disable-next-line @next/next/no-img-element -- S3 or /public URLs */}
                <img src={img.url} alt="" className="studio-media-cover" />
                {i === 0 && (
                  <span style={{ position: "absolute", top: 6, left: 6 }}>
                    <StatusTag tone="solid">Cover</StatusTag>
                  </span>
                )}
              </div>
            }
            actions={[
              <ScissorOutlined
                key="c"
                aria-label="Crop"
                onClick={() =>
                  setCropJob({
                    kind: "replace",
                    index: i,
                    preview: img.url,
                    fileName: img.alt || `product-${i + 1}.jpg`,
                  })
                }
              />,
              <ArrowLeftOutlined key="l" aria-label="Move left" onClick={() => move(i, -1)} />,
              <ArrowRightOutlined key="r" aria-label="Move right" onClick={() => move(i, 1)} />,
              <DeleteOutlined
                key="d"
                aria-label="Remove"
                onClick={() => onChange(images.filter((_, j) => j !== i))}
              />,
            ]}
            styles={{ body: { padding: 6 } }}
          >
            <Input
              size="small"
              variant="borderless"
              placeholder="Alt text"
              value={img.alt ?? ""}
              onChange={(e) => onChange(images.map((x, j) => (j === i ? { ...x, alt: e.target.value } : x)))}
            />
          </Card>
        ))}
        <Upload.Dragger
          accept="image/*"
          multiple
          showUploadList={false}
          beforeUpload={(file, fileList) => {
            if (file === fileList[0]) {
              const list = fileList.filter((f) => f.type.startsWith("image/"));
              if (list.length) setQueue((q) => [...q, ...list]);
            }
            return false;
          }}
          style={{ minHeight: 180 }}
        >
          {busy ? (
            <Spin description={`Uploading ${busy}…`}>
              <div style={{ height: 60 }} />
            </Spin>
          ) : (
            <Flex vertical align="center" gap={4}>
              <PlusOutlined style={{ fontSize: 18 }} />
              <Typography.Text strong style={{ fontSize: 12 }}>
                Add photos
              </Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                Crop, then upload
              </Typography.Text>
            </Flex>
          )}
        </Upload.Dragger>
      </div>
      {error && <Typography.Text type="danger">{error}</Typography.Text>}
      <ImageCropModal
        open={Boolean(cropJob)}
        src={cropJob?.preview ?? null}
        fileName={cropJob?.kind === "file" ? cropJob.file.name : cropJob?.fileName}
        title={cropJob?.kind === "replace" ? "Recrop image" : "Crop image"}
        onCancel={closeCrop}
        onConfirm={onCropConfirm}
      />
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .list<ApiProduct>("/admin/products", { limit: 100 })
      .then((r) => setProducts(r.items))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  // The API returns the populated product; the form stores its id.
  const id = typeof value === "object" && value !== null ? (value as ApiProduct).id : value;

  return (
    <Select
      showSearch
      optionFilterProp="label"
      loading={loading}
      disabled={disabled}
      placeholder="Choose a product…"
      value={typeof id === "string" && id ? id : undefined}
      onChange={onChange}
      options={products.map((p) => ({ value: p.id, label: `${p.name} (${p.status})` }))}
    />
  );
}

/** The input for one ResourceConfig field, as an Ant Design control. */
export default function FieldInput({ field, value, onChange, uploadFolder }: Props) {
  const disabled = field.readOnly;

  switch (field.type) {
    case "textarea":
      return (
        <Input.TextArea
          autoSize={{ minRows: 3, maxRows: 10 }}
          value={String(value ?? "")}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "number":
      return (
        <InputNumber
          style={{ width: "100%" }}
          value={typeof value === "number" ? value : null}
          disabled={disabled}
          onChange={(v) => onChange(v ?? undefined)}
        />
      );
    case "select":
      return (
        <Select
          allowClear={!field.required}
          value={value ? String(value) : undefined}
          disabled={disabled}
          placeholder="—"
          onChange={(v) => onChange(v ?? "")}
          options={field.options?.map((o) => ({ value: o, label: optionLabel(o) }))}
        />
      );
    case "boolean":
      return <Switch checked={Boolean(value)} disabled={disabled} onChange={onChange} />;
    case "checkbox": {
      // options[0] = checked (e.g. active), options[1] = unchecked (e.g. inactive).
      // Legacy "published" still reads as checked until the piece is re-saved.
      const on = field.options?.[0] ?? "active";
      const off = field.options?.[1] ?? "inactive";
      const checked = value === on || value === "published" || value === true;
      return (
        <Checkbox checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked ? on : off)}>
          {checked ? optionLabel(on) : optionLabel(off)}
        </Checkbox>
      );
    }
    case "checkboxes": {
      const selected = Array.isArray(value) ? value.map(String) : [];
      const groups = field.optionGroups ?? [];
      return (
        <Flex vertical gap={12}>
          {groups.map((g) => (
            <div key={g.group}>
              <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 6 }}>
                {g.group}
              </Typography.Text>
              <Checkbox.Group
                disabled={disabled}
                value={selected.filter((v) => g.options.some((o) => o.value === v))}
                onChange={(groupVals) => {
                  const others = selected.filter((v) => !g.options.some((o) => o.value === v));
                  onChange([...others, ...groupVals.map(String)]);
                }}
                options={g.options.map((o) => ({ value: o.value, label: o.label }))}
                style={{ display: "flex", flexDirection: "column", gap: 6 }}
              />
            </div>
          ))}
        </Flex>
      );
    }
    case "list":
      return (
        <Input.TextArea
          autoSize={{ minRows: 3, maxRows: 10 }}
          value={Array.isArray(value) ? value.join("\n") : ""}
          disabled={disabled}
          placeholder="One per line"
          onChange={(e) => onChange(e.target.value.split("\n"))}
        />
      );
    case "color":
      return (
        <ColorPicker
          showText
          disabledAlpha
          format="hex"
          value={String(value ?? "#000000")}
          disabled={disabled}
          onChange={(c) => onChange(c.toHexString())}
        />
      );
    case "date":
      return (
        <DatePicker
          style={{ width: "100%" }}
          format="D MMM YYYY"
          value={typeof value === "string" && value ? dayjs(value) : null}
          disabled={disabled}
          onChange={(d) => onChange(d ? d.format("YYYY-MM-DD") : "")}
        />
      );
    case "image": {
      if (disabled) return null;
      const img = value as ApiImage | undefined;
      return (
        <Flex vertical gap={8}>
          <MediaDrop
            kind="image"
            value={img?.url}
            folder={uploadFolder}
            onChange={(url) => onChange(url ? { ...img, url } : undefined)}
          />
          {img?.url && (
            <Input
              placeholder="Alt text (describes the photo)"
              value={img.alt ?? ""}
              onChange={(e) => onChange({ ...img, alt: e.target.value })}
            />
          )}
        </Flex>
      );
    }
    case "images":
      return (
        <ImageGallery
          images={Array.isArray(value) ? (value as ApiImage[]) : []}
          onChange={onChange}
          folder={uploadFolder}
        />
      );
    case "video":
      return disabled ? null : (
        <MediaDrop
          kind="video"
          value={typeof value === "string" ? value : undefined}
          folder={uploadFolder}
          onChange={onChange}
        />
      );
    case "product":
      return <ProductSelect value={value} onChange={onChange} disabled={disabled} />;
    default:
      return (
        <Input
          value={String(value ?? "")}
          disabled={disabled}
          type={field.name === "password" ? "password" : undefined}
          autoComplete={field.name === "password" ? "new-password" : undefined}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}
