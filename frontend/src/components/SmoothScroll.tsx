"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";

function jumpToTop(lenis: Lenis | null) {
  if (lenis) {
    lenis.resize();
    lenis.scrollTo(0, { immediate: true, force: true });
  }
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

/**
 * Site-wide Lenis smooth scroll. Soft navigations must reset Lenis to the top:
 * long pages leave a large scroll offset, so short routes (Atelier, etc.) paint
 * as a blank white void until a hard reload recreates Lenis at 0.
 */
export default function SmoothScroll() {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

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
    lenisRef.current = lenis;

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
      lenisRef.current = null;
      lenis.destroy();
    };
  }, []);

  useLayoutEffect(() => {
    if (pathname?.startsWith("/admin")) return;

    jumpToTop(lenisRef.current);
    window.dispatchEvent(new Event("scroll"));

    // Remeasure after the new (often shorter) page commits, then pin to top again.
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      jumpToTop(lenisRef.current);
      inner = requestAnimationFrame(() => {
        jumpToTop(lenisRef.current);
        window.dispatchEvent(new Event("scroll"));
      });
    });

    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [pathname]);

  return null;
}
