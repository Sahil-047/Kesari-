"use client";

import { motion, useInView } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { drawStagger, drawVariants, useReducedMotionSafe } from "@/lib/motion";

type Props = {
  draw?: boolean;
  children: ReactNode;
  viewBox?: string;
  className?: string;
  stroke?: string;
  strokeWidth?: number;
};

/** Wrapper that animates child pathLength once in view */
export default function DrawSvg({
  draw = true,
  children,
  className = "",
  viewBox = "0 0 200 200",
  stroke = "currentColor",
  strokeWidth = 1.15,
}: Props) {
  const ref = useRef<SVGSVGElement>(null);
  const reduce = useReducedMotionSafe();
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.svg
      ref={ref}
      viewBox={viewBox}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      className={className}
      initial={draw && !reduce ? "hidden" : "show"}
      animate={draw && !reduce ? (inView ? "show" : "hidden") : "show"}
      variants={drawStagger}
      aria-hidden
    >
      {children}
    </motion.svg>
  );
}

export function DrawPath({
  d,
  className,
}: {
  d: string;
  className?: string;
}) {
  return (
    <motion.path
      d={d}
      className={className}
      variants={drawVariants}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}
