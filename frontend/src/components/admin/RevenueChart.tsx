"use client";

import { bucketLabel, inr } from "@/lib/admin/format";
import { useEffect, useRef, useState } from "react";

type Point = { key: string; revenue: number; orders: number };

const HEIGHT = 220;
const PAD = { top: 16, right: 8, bottom: 26, left: 56 };

/** Round the axis maximum up to a friendly number. */
function niceMax(value: number): number {
  if (value <= 0) return 1000;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((s) => s * magnitude >= value) ?? 10;
  return step * magnitude;
}

/**
 * Revenue per day (or month) as bars: one series, so the title names it and
 * there is no legend. Hovering a bar shows its date, revenue and orders.
 */
export default function RevenueChart({ data }: { data: Point[] }) {
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

  const max = niceMax(Math.max(...data.map((d) => d.revenue), 0));
  const plotW = width - PAD.left - PAD.right;
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const slot = plotW / Math.max(data.length, 1);
  const barW = Math.max(2, Math.min(28, slot - 2)); // 2px surface gap between bars
  const y = (v: number) => PAD.top + plotH - (v / max) * plotH;
  const ticks = [0, max / 2, max];
  const labelEvery = Math.ceil(data.length / 8);
  const active = hover === null ? null : data[hover];

  return (
    <div ref={boxRef} className="relative">
      <svg width={width} height={HEIGHT} role="img" aria-label="Revenue over time" className="block">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} stroke="var(--cms-border)" strokeDasharray={t === 0 ? undefined : "3 4"} />
            <text x={PAD.left - 8} y={y(t) + 4} textAnchor="end" className="cms-mono" fontSize="10.5" fill="var(--cms-muted)">
              {inr(t, { compact: true })}
            </text>
          </g>
        ))}

        {data.map((d, i) => {
          const x = PAD.left + i * slot + (slot - barW) / 2;
          const h = Math.max(d.revenue > 0 ? 2 : 0, (d.revenue / max) * plotH);
          const isHover = hover === i;
          return (
            <g key={d.key}>
              {/* Rounded top, square base on the axis. */}
              {h > 0 && (
                <path
                  d={`M${x},${y(0)} V${y(0) - h + Math.min(4, h)} Q${x},${y(0) - h} ${x + Math.min(4, barW / 2)},${y(0) - h} H${x + barW - Math.min(4, barW / 2)} Q${x + barW},${y(0) - h} ${x + barW},${y(0) - h + Math.min(4, h)} V${y(0)} Z`}
                  fill={isHover ? "var(--cms-accent-hover)" : "var(--cms-accent)"}
                />
              )}
              {i % labelEvery === 0 && (
                <text x={x + barW / 2} y={HEIGHT - 8} textAnchor="middle" className="cms-mono" fontSize="10" fill="var(--cms-muted)">
                  {bucketLabel(d.key)}
                </text>
              )}
              {/* Hit target taller and wider than the bar. */}
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
          className="pointer-events-none absolute z-10 min-w-[150px] -translate-x-1/2 rounded-[4px] border border-[var(--cms-line)] bg-[var(--cms-surface)] px-3 py-2 shadow-[4px_4px_0_0_var(--cms-line)]"
          style={{
            left: Math.min(Math.max(PAD.left + hover * slot + slot / 2, 80), width - 80),
            top: Math.max(0, y(active.revenue) - 70),
          }}
        >
          <p className="cms-mono text-[10.5px] uppercase tracking-[0.08em] text-[var(--cms-muted)]">{bucketLabel(active.key)}</p>
          <p className="cms-display text-[16px]">{inr(active.revenue)}</p>
          <p className="text-[12px] text-[var(--cms-muted)]">
            {active.orders} order{active.orders === 1 ? "" : "s"}
          </p>
        </div>
      )}
    </div>
  );
}
