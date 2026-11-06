"use client";

import { DeleteOutlined, FolderOpenOutlined, InboxOutlined, LinkOutlined, ScissorOutlined } from "@ant-design/icons";
import { api, type PageMeta } from "@/lib/api/client";
import type { ApiMedia } from "@/lib/api/types";
import { Button, Card, Empty, Flex, Input, Modal, Pagination, Space, Spin, Typography, Upload } from "antd";
import { useEffect, useState } from "react";
import ImageCropModal from "./ImageCropModal";

export type MediaKind = "image" | "video";

/** Uploads one file to the S3 media library; alt text defaults to the file name. */
export async function uploadToLibrary(file: File, folder?: string): Promise<ApiMedia> {
  const form = new FormData();
  form.append("file", file);
  form.append("alt", file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
  if (folder) form.append("folder", folder);
  return api.post<ApiMedia>("/admin/media", form);
}

/** Thumbnail of an image or a silent looping video. */
export function MediaPreview({ kind, url, className }: { kind: MediaKind; url: string; className?: string }) {
  return kind === "image" ? (
    // eslint-disable-next-line @next/next/no-img-element -- S3 proxy or /public URLs
    <img src={url} alt="" className={className} />
  ) : (
    <video src={url} muted loop autoPlay playsInline className={className} />
  );
}

/** Modal grid of already-uploaded files of one kind. */
export function LibraryPicker({
  kind,
  open,
  onPick,
  onClose,
}: {
  kind: MediaKind;
  open: boolean;
  onPick: (media: ApiMedia) => void;
  onClose: () => void;
}) {
  const [items, setItems] = useState<ApiMedia[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on open / page change
    setLoading(true);
    api
      .list<ApiMedia>("/admin/media", { type: kind, page, limit: 24 })
      .then((r) => {
        if (cancelled) return;
        setItems(r.items);
        setMeta(r.meta);
      })
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : "Could not load the library"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [open, kind, page]);

  return (
    <Modal title="Choose from library" open={open} onCancel={onClose} footer={null} width={860} destroyOnHidden>
      <Spin spinning={loading}>
        {error && <Typography.Text type="danger">{error}</Typography.Text>}
        {!error && !loading && items.length === 0 ? (
          <Empty description="Nothing uploaded yet. Drop a file into the field instead." />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
            {items.map((m) => (
              <Card
                key={m.id}
                hoverable
                size="small"
                onClick={() => onPick(m)}
                cover={<MediaPreview kind={kind} url={m.url} className="studio-media-cover" />}
                styles={{ body: { padding: "6px 8px" } }}
              >
                <Typography.Text ellipsis style={{ fontSize: 12 }}>
                  {m.alt || m.originalName}
                </Typography.Text>
              </Card>
            ))}
          </div>
        )}
      </Spin>
      {meta && meta.pages > 1 && (
        <Flex justify="end" style={{ marginTop: 16 }}>
          <Pagination current={page} pageSize={meta.limit} total={meta.total} onChange={setPage} showSizeChanger={false} />
        </Flex>
      )}
    </Modal>
  );
}

/**
 * The one control for every single image or video field: drop a file (uploaded
 * to S3 straight away), pick from the library, or paste a link.
 */
export default function MediaDrop({
  kind = "image",
  value,
  onChange,
  folder,
}: {
  kind?: MediaKind;
  value: string | undefined;
  onChange: (url: string) => void;
  /** Optional S3 folder (e.g. products/soft-ivory). */
  folder?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [library, setLibrary] = useState(false);
  const [linkMode, setLinkMode] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropName, setCropName] = useState("image.jpg");

  const uploadFile = async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      onChange((await uploadToLibrary(file, folder)).url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith(`${kind}/`)) {
      setError(kind === "image" ? "That isn't an image." : "That isn't a video.");
      return;
    }
    if (kind === "image") {
      if (cropSrc?.startsWith("blob:")) URL.revokeObjectURL(cropSrc);
      setCropName(file.name);
      setCropSrc(URL.createObjectURL(file));
      return;
    }
    await uploadFile(file);
  };

  const closeCrop = () => {
    if (cropSrc?.startsWith("blob:")) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
  };

  return (
    <div>
      <Upload.Dragger
        accept={kind === "image" ? "image/*" : "video/mp4,video/webm"}
        showUploadList={false}
        multiple={false}
        disabled={busy}
        beforeUpload={(file) => {
          handleFile(file);
          return false;
        }}
        style={{ padding: 0 }}
      >
        <Flex align="center" gap={16} style={{ padding: "4px 12px", textAlign: "left" }}>
          <div
            style={{
              width: 84,
              height: 108,
              flexShrink: 0,
              borderRadius: 6,
              overflow: "hidden",
              background: "#f5f5f4",
              display: "grid",
              placeItems: "center",
            }}
          >
            {busy ? (
              <Spin />
            ) : value ? (
              <MediaPreview kind={kind} url={value} className="studio-media-cover" />
            ) : (
              <InboxOutlined style={{ fontSize: 24, color: "#57534e" }} />
            )}
          </div>
          <div style={{ minWidth: 0 }}>
            <Typography.Text strong>
              {busy ? "Uploading…" : value ? `Replace ${kind}` : `Add ${kind === "image" ? "an image" : "a video"}`}
            </Typography.Text>
            <br />
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Click or drag a file to this area
            </Typography.Text>
            {value && (
              <Typography.Paragraph type="secondary" ellipsis style={{ fontSize: 11, margin: "4px 0 0", maxWidth: 360 }}>
                {value}
              </Typography.Paragraph>
            )}
          </div>
        </Flex>
      </Upload.Dragger>

      <Space size={4} style={{ marginTop: 8 }} wrap>
        <Button size="small" icon={<FolderOpenOutlined />} onClick={() => setLibrary(true)}>
          Choose from library
        </Button>
        {kind === "image" && value && (
          <Button
            size="small"
            icon={<ScissorOutlined />}
            onClick={() => {
              setCropName("image.jpg");
              setCropSrc(value);
            }}
          >
            Crop
          </Button>
        )}
        <Button size="small" type={linkMode ? "primary" : "default"} ghost={linkMode} icon={<LinkOutlined />} onClick={() => setLinkMode((m) => !m)}>
          {linkMode ? "Hide link" : "Use a link"}
        </Button>
        {value && (
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => onChange("")}>
            Remove
          </Button>
        )}
      </Space>

      {linkMode && (
        <Input
          style={{ marginTop: 8 }}
          placeholder={kind === "image" ? "https://… or /images/…" : "https://… or /videos/…"}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {error && (
        <Typography.Text type="danger" style={{ display: "block", marginTop: 8 }}>
          {error}
        </Typography.Text>
      )}

      <LibraryPicker
        kind={kind}
        open={library}
        onClose={() => setLibrary(false)}
        onPick={(m) => {
          onChange(m.url);
          setLibrary(false);
        }}
      />

      <ImageCropModal
        open={Boolean(cropSrc)}
        src={cropSrc}
        fileName={cropName}
        onCancel={closeCrop}
        onConfirm={async (file) => {
          closeCrop();
          await uploadFile(file);
        }}
      />
    </div>
  );
}
