"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import "./opening.css";

const DEVA = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
const SIMULATED_MS = 9000;
const EXIT_PAUSE_MS = 280;
const EXIT_MS = 1400;

declare global {
  interface Window {
    __kesariSetProgress?: (value: number) => void;
    __kesariUseSimulatedProgress?: boolean;
    __kesariPendingProgress?: number;
  }
}

function toDevanagari(value: number) {
  return String(Math.max(0, Math.min(100, Math.round(value))))
    .split("")
    .map((digit) => DEVA[Number(digit)])
    .join("");
}

function eased(t: number) {
  return 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 2.4);
}

export function KesariOpening() {
  const uid = useId().replace(/:/g, "");
  const jaliId = `jali-${uid}`;
  const doorId = `door-${uid}`;
  const lampId = `lamp-${uid}`;
  const glowId = `glow-${uid}`;

  const rootRef = useRef<HTMLDivElement>(null);
  const lampRef = useRef<SVGRectElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const startRef = useRef(0);
  const frameRef = useRef(0);
  const finishingRef = useRef(false);
  const manualRef = useRef(false);
  const lastPctRef = useRef(-1);
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);

  const applyProgress = useCallback((value: number) => {
    const p = Math.max(0, Math.min(1, value));
    const root = rootRef.current;
    if (root) {
      root.style.setProperty("--p", String(p));
      root.setAttribute("aria-valuenow", String(Math.round(p * 100)));
    }
    const riseH = (312 - 76) * p;
    if (lampRef.current) {
      lampRef.current.setAttribute("y", String(312 - riseH));
      lampRef.current.setAttribute("height", String(Math.max(riseH, 0.01)));
    }
    const pct = Math.round(p * 100);
    if (countRef.current && pct !== lastPctRef.current) {
      lastPctRef.current = pct;
      countRef.current.textContent = toDevanagari(pct);
    }
  }, []);

  const teardown = useCallback(() => {
    finishingRef.current = false;
    setVisible(false);
    setExiting(false);
    document.body.style.overflow = "";
    document.body.dataset.kesariOpened = "1";
    window.dispatchEvent(new Event("kesari:opened"));
  }, []);

  const finish = useCallback(() => {
    if (finishingRef.current) return;
    finishingRef.current = true;
    applyProgress(1);
    window.setTimeout(() => {
      setExiting(true);
      window.setTimeout(teardown, EXIT_MS);
    }, EXIT_PAUSE_MS);
  }, [applyProgress, teardown]);

  const runSimulated = useCallback(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduce ? 1100 : SIMULATED_MS;
    startRef.current = performance.now();
    finishingRef.current = false;
    manualRef.current = false;

    const tick = (now: number) => {
      if (manualRef.current) return;
      const t = Math.min(1, (now - startRef.current) / duration);
      applyProgress(eased(t));
      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        finish();
      }
    };

    frameRef.current = requestAnimationFrame(tick);
  }, [applyProgress, finish]);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    /*
      Real load progress from the facade hero:
      window.__kesariSetProgress(0.42)
      window.__kesariSetProgress(1)
      Falls back to a slow simulated fill if the model never reports.
    */
    window.__kesariUseSimulatedProgress = true;
    window.__kesariSetProgress = (value: number) => {
      manualRef.current = true;
      window.__kesariUseSimulatedProgress = false;
      window.__kesariPendingProgress = value;
      cancelAnimationFrame(frameRef.current);
      applyProgress(value);
      if (value >= 1) finish();
    };

    if (typeof window.__kesariPendingProgress === "number") {
      window.__kesariSetProgress(window.__kesariPendingProgress);
    } else {
      runSimulated();
    }

    return () => {
      cancelAnimationFrame(frameRef.current);
      document.body.style.overflow = "";
      delete window.__kesariSetProgress;
    };
    // Boot on every mount / reload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;

  return (
    <div
      ref={rootRef}
      className={exiting ? "kesari-opening is-exit" : "kesari-opening"}
      role="progressbar"
      aria-label="Opening the house of Kesari"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
    >
      <div className="ko-curtain is-left" />
      <div className="ko-curtain is-right" />

      <div className="ko-stage">
        <div className="ko-glow" />
        <svg className="ko-arch" viewBox="0 0 240 360" aria-hidden="true">
          <defs>
            <pattern
              id={jaliId}
              width="16"
              height="16"
              patternUnits="userSpaceOnUse"
            >
              <g
                fill="none"
                stroke="#9a7434"
                strokeWidth="0.55"
                transform="translate(8 8)"
              >
                <rect x="-3.1" y="-3.1" width="6.2" height="6.2" />
                <rect
                  x="-3.1"
                  y="-3.1"
                  width="6.2"
                  height="6.2"
                  transform="rotate(45)"
                />
                <circle cx="0" cy="0" r="0.85" fill="#c9a45c" stroke="none" />
              </g>
            </pattern>
            <clipPath id={doorId}>
              <path d="M64 312 V184 C64 168 68 160 76 154 C66 144 66 128 76 116 C88 102 100 90 120 76 C140 90 152 102 164 116 C174 128 174 144 164 154 C172 160 176 168 176 184 V312 Z" />
            </clipPath>
                <clipPath id={lampId}>
                  <rect ref={lampRef} x="50" y="312" width="140" height="0.01" />
                </clipPath>
            <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="0.7" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <circle className="ko-finial-dot" cx="120" cy="26" r="3.4" />
          <path className="ko-finial" d="M120 31 V50" strokeWidth="1.3" />

          <g clipPath={`url(#${doorId})`} className="ko-jali-dim">
            <rect x="48" y="70" width="144" height="250" fill={`url(#${jaliId})`} />
          </g>
          <g clipPath={`url(#${doorId})`}>
            <g clipPath={`url(#${lampId})`} filter={`url(#${glowId})`} className="ko-jali-lit">
              <rect x="48" y="70" width="144" height="250" fill={`url(#${jaliId})`} />
            </g>
          </g>

          <path
            className="ko-draw is-outer"
            pathLength="1"
            d="M46 324 V178 C46 160 50 150 60 142 C48 130 46 112 58 98 C70 84 86 70 120 52 C154 70 170 84 182 98 C194 112 192 130 180 142 C190 150 194 160 194 178 V324"
          />
          <path
            className="ko-draw is-inner"
            pathLength="1"
            d="M64 312 V184 C64 168 68 160 76 154 C66 144 66 128 76 116 C88 102 100 90 120 76 C140 90 152 102 164 116 C174 128 174 144 164 154 C172 160 176 168 176 184 V312"
          />
          <path className="ko-plinth" d="M34 332 H206" strokeWidth="1.15" />
          <path className="ko-plinth" d="M26 342 H214" strokeWidth="1.15" />
        </svg>
        <div className="ko-copy">
          <p className="ko-word">Kesari</p>
          <p className="ko-byline">by Bhumika Patel</p>
          <p className="ko-count">
            <span ref={countRef}>०</span>
            <span className="ko-pct">%</span>
          </p>
        </div>
      </div>

      <div className="ko-foxing" />
      <div className="ko-fibers" />
      <div className="ko-sepia" />
      <div className="ko-vignette" />
      <div className="ko-grain" />
      <div className="ko-grain-fine" />
      <div className="ko-speckle" />
    </div>
  );
}
