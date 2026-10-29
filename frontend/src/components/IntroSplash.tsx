"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import LoadingScreen, { DURATION_MS } from "./LoadingScreen";

/**
 * Plays on every full page load (first visit or reload). Mounted in the root
 * layout, so client-side navigation between pages never re-triggers it.
 */
export default function IntroSplash() {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(1);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
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
      exitTimer = window.setTimeout(() => setVisible(false), 480);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(exitTimer);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="fixed inset-0 z-[100]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
        >
          <LoadingScreen
            autoPlay={false}
            progress={progress}
            exiting={exiting}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
