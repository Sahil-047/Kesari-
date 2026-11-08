"use client";

import { bucketLabel, inr } from "@/lib/admin/format";
import { theme } from "antd";
import { useEffect, useRef, useState } from "react";

type Point = { key: string; revenue: number; orders: number };

const HEIGHT = 240;

/** Round the axis maximum up to a friendly number. */
function niceMax(value: number): number {
  if (value <= 0) return 1000;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((s) => s * magnitude >= value) ?? 10;
  return step * magnitude;
}

/**
 * Revenue per day (or month) as bars, coloured from the Ant theme. One series,
 * so the card title names it and there is no legend; hover shows the bucket.
 */
export default function RevenueChart({ data }: { data: Point[] }) {
  const { token } = theme.useToken();
  const [hover, setHover] = useState<number | null>(null);
  const [width, setWidth] = useState(720);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.round(entry!.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const PAD = {
    top: 16,
    right: 8,
    bottom: 26,
    left: width < 420 ? 40 : 56,
  };
  const max = niceMax(Math.max(...data.map((d) => d.revenue), 0));
  const plotW = Math.max(0, width - PAD.left - PAD.right);
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const slot = plotW / Math.max(data.length, 1);
  const barW = Math.max(2, Math.min(28, slot - 2));
  const y = (v: number) => PAD.top + plotH - (v / max) * plotH;
  const ticks = [0, max / 2, max];
  const labelEvery = Math.ceil(data.length / 8);
  const active = hover === null ? null : data[hover];
  // Text alternative for screen readers: total, busiest bucket and range.
  const total = data.reduce((sum, d) => sum + d.revenue, 0);
  const peak = data.reduce<Point | null>((best, d) => (!best || d.revenue > best.revenue ? d : best), null);
  const summary =
    data.length === 0
      ? "Revenue chart: no data for this period"
      : `Revenue ${inr(total)} from ${bucketLabel(data[0]!.key)} to ${bucketLabel(data[data.length - 1]!.key)}` +
        (peak && peak.revenue > 0 ? `; highest ${inr(peak.revenue)} on ${bucketLabel(peak.key)}` : "");

  return (
    <div ref={boxRef} style={{ position: "relative" }}>
      <svg width={width} height={HEIGHT} role="img" aria-label={summary} style={{ display: "block" }}>
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={PAD.left}
              x2={width - PAD.right}
              y1={y(t)}
              y2={y(t)}
              stroke={token.colorBorderSecondary}
              strokeDasharray={t === 0 ? undefined : "3 4"}
            />
            <text x={PAD.left - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill={token.colorTextTertiary}>
              {inr(t, { compact: true })}
            </text>
          </g>
        ))}

        {data.map((d, i) => {
          const x = PAD.left + i * slot + (slot - barW) / 2;
          const h = Math.max(d.revenue > 0 ? 2 : 0, (d.revenue / max) * plotH);
          return (
            <g key={d.key}>
              {h > 0 && (
                <rect
                  x={x}
                  y={y(0) - h}
                  width={barW}
                  height={h}
                  rx={Math.min(3, barW / 2)}
                  fill={hover === i ? token.colorPrimaryHover : token.colorPrimary}
                />
              )}
              {i % labelEvery === 0 && (
                <text x={x + barW / 2} y={HEIGHT - 8} textAnchor="middle" fontSize="11" fill={token.colorTextTertiary}>
                  {bucketLabel(d.key)}
                </text>
              )}
              <rect
                x={PAD.left + i * slot}
                y={PAD.top}
                width={slot}
                height={plotH}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              />
            </g>
          );
        })}
      </svg>

      {active && hover !== null && (
        <div
          style={{
            position: "absolute",
            pointerEvents: "none",
            zIndex: 10,
            minWidth: 140,
            transform: "translateX(-50%)",
            left: Math.min(Math.max(PAD.left + hover * slot + slot / 2, 80), width - 80),
            top: Math.max(0, y(active.revenue) - 76),
            padding: "8px 12px",
            background: token.colorBgElevated,
            borderRadius: token.borderRadius,
            boxShadow: token.boxShadowSecondary,
          }}
        >
          <div style={{ fontSize: 12, color: token.colorTextSecondary }}>{bucketLabel(active.key)}</div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{inr(active.revenue)}</div>
          <div style={{ fontSize: 12, color: token.colorTextSecondary }}>
            {active.orders} order{active.orders === 1 ? "" : "s"}
          </div>
        </div>
      )}
    </div>
  );
}
