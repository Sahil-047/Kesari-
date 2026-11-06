import type { ReactNode } from "react";

/**
 * Unicolor status badge. Meaning is carried by weight, not hue:
 * - solid: done / live (published, active, paid, delivered)
 * - outline + dot: needs attention (new, pending, unpaid, unsaved)
 * - soft: in progress (draft changes, confirmed, part paid)
 * - muted: off / inactive (draft, inactive, cancelled, refunded)
 */
export type Tone = "solid" | "outline" | "soft" | "muted";

export default function StatusTag({ tone = "soft", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className="studio-status" data-tone={tone}>
      {tone === "outline" && <span className="studio-status-dot" aria-hidden />}
      {children}
    </span>
  );
}
