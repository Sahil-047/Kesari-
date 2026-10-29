"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import { SPRING_SCROLL, useReducedMotionSafe } from "@/lib/motion";

/**
 * Page-spine gold hairline drawn by overall page scroll progress.
 * Mount once wrapping the weddings main content.
 */
export default function GoldThread({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotionSafe();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const smooth = useSpring(scrollYProgress, SPRING_SCROLL);
  const pathLength = useTransform(smooth, [0, 1], [0, 1]);

  return (
    <div ref={ref} className="relative">
      {!reduce ? (
        <svg
          className="pointer-events-none absolute left-[max(1.25rem,calc(50%-820px))] top-0 z-[5] hidden h-full w-8 md:block"
          viewBox="0 0 32 1000"
          preserveAspectRatio="none"
          aria-hidden
        >
          <motion.path
            d="M16 0 C10 80 22 160 16 240 C10 320 22 400 16 480 C10 560 22 640 16 720 C10 800 22 880 16 1000"
            fill="none"
            stroke="var(--gold)"
            strokeWidth="1"
            strokeOpacity="0.7"
            style={{ pathLength }}
          />
        </svg>
      ) : null}
      {children}
    </div>
  );
}
