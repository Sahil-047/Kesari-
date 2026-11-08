"use client";

import { Button, Flex, Modal, Segmented, Slider, Spin, Typography } from "antd";
import { useCallback, useEffect, useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";

const ASPECTS = {
  "4:3": 4 / 3,
  "16:9": 16 / 9,
  "3:4": 3 / 4,
  "9:16": 9 / 16,
} as const;

type AspectKey = keyof typeof ASPECTS;

function aspectKeyFromValue(value: number | undefined): AspectKey {
  if (value === ASPECTS["16:9"]) return "16:9";
  if (value === ASPECTS["3:4"]) return "3:4";
  if (value === ASPECTS["9:16"]) return "9:16";
  return "4:3";
}

/** Working bitmap size — huge camera files are what made the cropper lag. */
const WORK_MAX = 1400;
/** Output long edge for the uploaded JPEG. */
const OUT_MAX = 1600;

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", () => reject(new Error("Could not load image")));
    img.crossOrigin = "anonymous";
    img.src = src;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, quality = 0.88) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not encode image"))), "image/jpeg", quality);
  });
}

/** Shrink big photos so drag/zoom stays smooth on the main thread. */
async function toWorkingUrl(src: string): Promise<{ url: string; revoke: boolean }> {
  const img = await loadImage(src);
  const edge = Math.max(img.naturalWidth, img.naturalHeight);
  if (edge <= WORK_MAX) return { url: src, revoke: false };

  const scale = WORK_MAX / edge;
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const blob = await canvasToBlob(canvas, 0.9);
  return { url: URL.createObjectURL(blob), revoke: true };
}

async function cropToFile(imageSrc: string, area: Area, fileName: string): Promise<File> {
  const image = await loadImage(imageSrc);
  let width = Math.max(1, Math.round(area.width));
  let height = Math.max(1, Math.round(area.height));
  const long = Math.max(width, height);
  if (long > OUT_MAX) {
    const s = OUT_MAX / long;
    width = Math.max(1, Math.round(width * s));
    height = Math.max(1, Math.round(height * s));
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, width, height);

  const blob = await canvasToBlob(canvas);
  const base = fileName.replace(/\.[^.]+$/, "") || "image";
  return new File([blob], `${base}.jpg`, { type: "image/jpeg" });
}

type Props = {
  open: boolean;
  src: string | null;
  fileName?: string;
  title?: string;
  /** Defaults to 4:3. */
  defaultAspect?: number;
  onCancel: () => void;
  onConfirm: (file: File) => void | Promise<void>;
};

/**
 * Fast crop: whole image visible at start, zoom in to tighten.
 * Aspects: 4:3 (default), 16:9, 3:4, 9:16.
 */
export default function ImageCropModal({
  open,
  src,
  fileName = "image.jpg",
  title = "Frame the photo",
  defaultAspect = ASPECTS["4:3"],
  onCancel,
  onConfirm,
}: Props) {
  const [readyUrl, setReadyUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspectKey, setAspectKey] = useState<AspectKey>(() => aspectKeyFromValue(defaultAspect));
  const [saving, setSaving] = useState(false);
  const areaRef = useRef<Area | null>(null);
  const revokeRef = useRef<string | null>(null);
  const aspect = ASPECTS[aspectKey];

  useEffect(() => {
    if (!open || !src) {
      setReadyUrl(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setAspectKey(aspectKeyFromValue(defaultAspect));
    areaRef.current = null;

    toWorkingUrl(src)
      .then(({ url, revoke }) => {
        if (cancelled) {
          if (revoke) URL.revokeObjectURL(url);
          return;
        }
        if (revokeRef.current) URL.revokeObjectURL(revokeRef.current);
        revokeRef.current = revoke ? url : null;
        setReadyUrl(url);
      })
      .catch(() => {
        if (!cancelled) setReadyUrl(src);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, src, defaultAspect]);

  useEffect(() => {
    return () => {
      if (revokeRef.current) {
        URL.revokeObjectURL(revokeRef.current);
        revokeRef.current = null;
      }
    };
  }, []);

  // Keep pixels in a ref — setState here was re-rendering on every drag frame.
  const onCropComplete = useCallback((_a: Area, pixels: Area) => {
    areaRef.current = pixels;
  }, []);

  const confirm = async () => {
    if (!readyUrl || !areaRef.current) return;
    setSaving(true);
    try {
      const file = await cropToFile(readyUrl, areaRef.current, fileName);
      await onConfirm(file);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      width="min(560px, calc(100vw - 24px))"
      centered
      destroyOnHidden
      styles={{ body: { paddingTop: 12 } }}
      footer={
        <Flex justify="space-between" align="center" gap={8} wrap>
          <Segmented
            size="small"
            value={aspectKey}
            onChange={(v) => {
              setAspectKey(v as AspectKey);
              setCrop({ x: 0, y: 0 });
              setZoom(1);
            }}
            options={[
              { label: "4:3", value: "4:3" },
              { label: "16:9", value: "16:9" },
              { label: "3:4", value: "3:4" },
              { label: "9:16", value: "9:16" },
            ]}
          />
          <Flex gap={8}>
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="primary" loading={saving} disabled={!readyUrl || loading} onClick={confirm}>
              Looks good
            </Button>
          </Flex>
        </Flex>
      }
    >
      <Typography.Paragraph type="secondary" style={{ marginTop: 0, marginBottom: 10, fontSize: 13 }}>
        Whole photo is in the frame. Zoom in and drag to tighten the crop.
      </Typography.Paragraph>

      <div
        style={{
          position: "relative",
          width: "100%",
          height: 360,
          background: "#0c0a09",
          borderRadius: 10,
          overflow: "hidden",
          touchAction: "none",
        }}
      >
        {loading || !readyUrl ? (
          <Flex align="center" justify="center" style={{ height: "100%" }}>
            <Spin description="Preparing…" />
          </Flex>
        ) : (
          <Cropper
            image={readyUrl}
            crop={crop}
            zoom={zoom}
            minZoom={1}
            maxZoom={3}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            objectFit="contain"
            showGrid={false}
            zoomSpeed={0.35}
            zoomWithScroll
            restrictPosition
            style={{
              containerStyle: { background: "#0c0a09" },
              cropAreaStyle: { border: "2px solid rgba(255,255,255,0.85)" },
            }}
          />
        )}
      </div>

      <Flex align="center" gap={12} style={{ marginTop: 14 }}>
        <Typography.Text type="secondary" style={{ fontSize: 12, width: 40 }}>
          Zoom
        </Typography.Text>
        <Slider
          style={{ flex: 1, margin: 0 }}
          min={1}
          max={3}
          step={0.05}
          value={zoom}
          onChange={setZoom}
          disabled={loading || !readyUrl}
          tooltip={{ open: false }}
        />
      </Flex>
    </Modal>
  );
}
