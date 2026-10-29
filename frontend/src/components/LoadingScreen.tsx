"use client";

import { useEffect, useState } from "react";
import { toSanskritNumeral } from "@/lib/sanskrit";

const DURATION_MS = 3000;

type LoadingScreenProps = {
  /** When true, runs its own 0→100 / 3s cycle. */
  autoPlay?: boolean;
  /** Controlled progress 0–100. */
  progress?: number;
  /** Fade the whole overlay out */
  exiting?: boolean;
};

export default function LoadingScreen({
  autoPlay = true,
  progress: progressProp,
  exiting = false,
}: LoadingScreenProps) {
  const [internal, setInternal] = useState(1);

  useEffect(() => {
    if (!autoPlay || progressProp != null) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION_MS);
      setInternal(Math.max(1, Math.round(t * 100)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [autoPlay, progressProp]);

  const progress = progressProp ?? internal;
  const label = toSanskritNumeral(Math.max(1, progress));

  return (
    <div
      className={`parchment-surface parchment-noise fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden transition-opacity duration-500 ${
        exiting ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      role="status"
      aria-live="polite"
      aria-label={`Loading ${progress} percent`}
      aria-valuenow={progress}
      aria-valuemin={1}
      aria-valuemax={100}
    >
      <div className="relative z-10 flex flex-col items-center px-4">
        <p className="mb-8 font-sans text-[0.65rem] uppercase tracking-[0.45em] text-ink/55">
          Kesari
        </p>
        <p
          className="font-sans text-[clamp(2.5rem,8vw,4rem)] font-light tabular-nums tracking-[0.14em] text-ink"
          lang="sa"
        >
          {label}
          <span className="ml-1.5 text-[0.55em] opacity-65">%</span>
        </p>
        <div className="mt-8 h-px w-36 overflow-hidden bg-ink/15">
          <div className="h-full bg-ink/55" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}

export { DURATION_MS };
