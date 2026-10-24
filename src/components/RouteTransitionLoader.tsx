"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import LoadingScreen, { DURATION_MS } from "./LoadingScreen";

/**
 * Guarantees a full 3s Sanskrit % load on client navigations.
 * Next.js `loading.tsx` alone dismisses too early.
 */
export default function RouteTransitionLoader() {
  const pathname = usePathname();
  const isFirst = useRef(true);
  const [active, setActive] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [progress, setProgress] = useState(1);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }

    setActive(true);
    setExiting(false);
    setProgress(1);

    const start = performance.now();
    let raf = 0;
    let exitTimer = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION_MS);
      setProgress(Math.max(1, Math.round(t * 100)));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
        return;
      }
      setExiting(true);
      exitTimer = window.setTimeout(() => {
        setActive(false);
        setExiting(false);
      }, 480);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(exitTimer);
    };
  }, [pathname]);

  if (!active) return null;

  return (
    <LoadingScreen autoPlay={false} progress={progress} exiting={exiting} />
  );
}
