"use client";

import { CopyOutlined, DeleteOutlined, InboxOutlined, UploadOutlined } from "@ant-design/icons";
import { MediaPreview } from "@/components/admin/MediaDrop";
import ScreenHeader, { ScreenBody } from "@/components/admin/ScreenHeader";
import { api, type PageMeta } from "@/lib/api/client";
import type { ApiMedia } from "@/lib/api/types";
import {
  Alert,
  App,
  Button,
  Card,
  Empty,
  Flex,
  Input,
  Pagination,
  Popconfirm,
  Segmented,
  Spin,
  Tooltip,
  Typography,
  Upload,
} from "antd";
import { useCallback, useEffect, useState } from "react";

function formatSize(bytes: number) {
  return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

type Filter = "all" | "image" | "video";

export default function AdminMediaPage() {
  const { message } = App.useApp();
  const [items, setItems] = useState<ApiMedia[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [page, setPage] = useState(1);
  const [type, setType] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.list<ApiMedia>("/admin/media", {
        page,
        limit: 24,
        type: type === "all" ? undefined : type,
      });
      setItems(r.items);
      setMeta(r.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load media");
    } finally {
      setLoading(false);
    }
  }, [page, type]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount and filter change
    load();
  }, [load]);

  const upload = async (files: File[]) => {
    if (!files.length) return;
    setUploading(files.length);
    setError(null);
    let ok = 0;
    for (const file of files) {
      try {
        const form = new FormData();
        form.append("file", file);
        form.append("alt", file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
        await api.post("/admin/media", form);
        ok++;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      }
      setUploading((n) => n - 1);
    }
    if (ok) message.success(`${ok} file${ok === 1 ? "" : "s"} uploaded`);
    await load();
  };

  const remove = async (m: ApiMedia) => {
    try {
      await api.delete(`/admin/media/${m.id}`);
      message.success("Deleted from S3");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete");
    }
  };

  const saveAlt = async (m: ApiMedia, alt: string) => {
    if (alt === m.alt) return;
    try {
      await api.patch(`/admin/media/${m.id}`, { alt });
      message.success("Alt text saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save alt text");
    }
  };

  const picker = {
    accept: "image/*,video/mp4,video/webm,video/quicktime,.mov,.m4v",
    multiple: true,
    showUploadList: false,
    // Ant calls this once per file; upload the whole batch from the first call.
    beforeUpload: (file: File, list: File[]) => {
      if (file === list[0]) void upload(list);
      return false;
    },
  };

  return (
    <>
      <ScreenHeader
        title="Media library"
        description={meta ? `${meta.total} file${meta.total === 1 ? "" : "s"}` : undefined}
        actions={
          <Upload {...picker}>
            <Button type="primary" icon={<UploadOutlined />}>
              Upload
            </Button>
          </Upload>
        }
      />

      <ScreenBody>
        <Upload.Dragger {...picker} disabled={uploading > 0}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            {uploading ? `Uploading ${uploading} file${uploading === 1 ? "" : "s"}…` : "Click or drag photos and films here"}
          </p>
          <p className="ant-upload-hint">JPG, PNG, WebP, AVIF, MP4, WebM or MOV · several at once is fine</p>
        </Upload.Dragger>

        <Flex justify="space-between" align="center" wrap gap={8} style={{ margin: "24px 0 16px" }}>
          <div className="studio-scroll-x" style={{ width: "100%" }}>
            <Segmented<Filter>
              value={type}
              block
              onChange={(v) => {
                setPage(1);
                setType(v);
              }}
              options={[
                { value: "all", label: "All" },
                { value: "image", label: "Photos" },
                { value: "video", label: "Films" },
              ]}
            />
          </div>
        </Flex>

        {error && <Alert type="error" showIcon closable message={error} onClose={() => setError(null)} style={{ marginBottom: 16 }} />}

        <Spin spinning={loading}>
          {items.length === 0 && !loading ? (
            <Card>
              <Empty description="Nothing uploaded yet" />
            </Card>
          ) : (
            <div className="studio-media-grid">
              {items.map((m) => (
                <Card
                  key={m.id}
                  size="small"
                  cover={
                    <MediaPreview
                      kind={m.mimeType.startsWith("image/") ? "image" : "video"}
                      url={m.url}
                      className="studio-media-cover"
                    />
                  }
                  actions={[
                    <Tooltip key="copy" title="Copy link">
                      <CopyOutlined
                        role="button"
                        tabIndex={0}
                        aria-label="Copy link"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            navigator.clipboard.writeText(m.url);
                            message.success("Link copied");
                          }
                        }}
                        onClick={() => {
                          navigator.clipboard.writeText(m.url);
                          message.success("Link copied");
                        }}
                      />
                    </Tooltip>,
                    <Popconfirm
                      key="delete"
                      title="Delete this file from S3?"
                      description="Pages still using it will show a broken image."
                      okText="Delete"
                      okButtonProps={{ danger: true }}
                      onConfirm={() => remove(m)}
                    >
                      <DeleteOutlined role="button" tabIndex={0} aria-label="Delete file" />
                    </Popconfirm>,
                  ]}
                  styles={{ body: { padding: 8 } }}
                >
                  <Input
                    size="small"
                    variant="borderless"
                    defaultValue={m.alt}
                    placeholder="Describe this file"
                    onBlur={(e) => saveAlt(m, e.target.value)}
                    style={{ fontWeight: 600, paddingInline: 0 }}
                  />
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {formatSize(m.size)}
                  </Typography.Text>
                </Card>
              ))}
            </div>
          )}
        </Spin>

        {meta && meta.pages > 1 && (
          <Flex justify="end" style={{ marginTop: 24 }}>
            <Pagination current={page} pageSize={meta.limit} total={meta.total} onChange={setPage} showSizeChanger={false} />
          </Flex>
        )}
      </ScreenBody>
    </>
  );
}
