"use client";

import { useReducedMotion } from "framer-motion";

export const EASE_FLUENT = [0.22, 1, 0.36, 1] as const;
export const EASE_VEIL = [0.65, 0, 0.35, 1] as const;

export const SPRING_SETTLE = {
  stiffness: 120,
  damping: 24,
  mass: 0.6,
} as const;

export const SPRING_SCROLL = {
  stiffness: 90,
  damping: 26,
  restDelta: 0.0005,
} as const;

export const LETTER_BLOOM = {
  stagger: 0.055,
  duration: 0.9,
  blurFrom: 14,
  yFrom: "0.35em",
  amount: 0.35,
} as const;

export function useReducedMotionSafe() {
  return useReducedMotion();
}

export const drawVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  show: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 1.4, ease: EASE_FLUENT },
  },
};

export const drawStagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
};
