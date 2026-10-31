"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import LoadingScreen, { DURATION_MS } from "./LoadingScreen";

const SEEN_KEY = "kesari.splash-seen";

const subscribeNoop = () => () => {};

/** True after hydration, false on the server and during the first client render. */
function useHydrated() {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
}

function hasSeenSplash(): boolean {
  try {
    return window.sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

function markSplashSeen() {
  try {
    window.sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    /* storage unavailable: the splash simply plays again next load */
  }
}

/**
 * The counting splash plays once per visit. Reloads in the same browser
 * session skip the count and fade out at once, so the site never makes a
 * returning visitor wait. Client-side navigation never re-triggers it.
 */
export default function IntroSplash() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") ?? false;
  const hydrated = useHydrated();

  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(1);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (!hydrated || isAdmin) return;

    const quick = hasSeenSplash();
    markSplashSeen();

    const duration = quick ? 0 : DURATION_MS;
    const start = performance.now();
    let raf = 0;
    let exitTimer = 0;

    const tick = (now: number) => {
      const t = duration === 0 ? 1 : Math.min(1, (now - start) / duration);
      setProgress(Math.max(1, Math.round(t * 100)));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
        return;
      }
      setExiting(true);
      exitTimer = window.setTimeout(() => setVisible(false), quick ? 0 : 420);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(exitTimer);
    };
  }, [hydrated, isAdmin]);

  if (isAdmin) return null;

  // Pre-hydration / first paint: plain DOM so server and client match.
  if (!hydrated) {
    return (
      <div className="fixed inset-0 z-[100]">
        <LoadingScreen autoPlay={false} progress={1} exiting={false} />
      </div>
    );
  }

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="fixed inset-0 z-[100]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        >
          <LoadingScreen autoPlay={false} progress={progress} exiting={exiting} />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
