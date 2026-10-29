"use client";

import type { Annotation } from "@/lib/bridal-collections";
import { EASE_FLUENT, useReducedMotionSafe } from "@/lib/motion";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function Annotations({ items }: { items: Annotation[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotionSafe();
  const inView = useInView(ref, { once: true, amount: 0.4 });

  return (
    <div
      ref={ref}
      className="pointer-events-none absolute inset-0 z-[3] hidden md:block"
      aria-hidden
    >
      {items.map((a, i) => {
        const x1 = a.x;
        const y1 = a.y;
        const x2 = a.anchorX;
        const y2 = a.anchorY;
        return (
          <div key={a.label} className="absolute inset-0">
            <svg className="absolute inset-0 h-full w-full overflow-visible">
              <motion.line
                x1={`${x1}%`}
                y1={`${y1}%`}
                x2={`${x2}%`}
                y2={`${y2}%`}
                stroke="var(--gold)"
                strokeWidth="1"
                strokeOpacity="0.65"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: inView || reduce ? 1 : 0 }}
                transition={{
                  duration: reduce ? 0 : 0.9,
                  delay: reduce ? 0 : 0.2 + i * 0.12,
                  ease: EASE_FLUENT,
                }}
              />
            </svg>
            <motion.span
              className="absolute font-sans text-[0.52rem] uppercase tracking-[0.24em] text-cream"
              style={{ left: `${x2}%`, top: `${y2}%` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: inView || reduce ? 0.9 : 0 }}
              transition={{
                duration: 0.5,
                delay: reduce ? 0 : 0.55 + i * 0.12,
              }}
            >
              {a.label}
            </motion.span>
          </div>
        );
      })}
    </div>
  );
}
