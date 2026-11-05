"use client";

import Lenis from "lenis";
import { useEffect } from "react";

export default function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      smoothWheel: true,
      syncTouch: false,
      lerp: 0.1,
      anchors: true,
      allowNestedScroll: true,
      stopInertiaOnNavigate: true,
      respectReducedMotion: true,
    });

    // Existing lightboxes lock the body, while Lenis scrolls the root element.
    const syncScrollLock = () => {
      const { overflowY } = window.getComputedStyle(document.body);
      if (overflowY === "hidden" || overflowY === "clip") {
        lenis.stop();
      } else {
        lenis.start();
      }
    };

    const observer = new MutationObserver(syncScrollLock);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["style", "class"],
    });
    syncScrollLock();

    return () => {
      observer.disconnect();
      lenis.destroy();
    };
  }, []);

  return null;
}
