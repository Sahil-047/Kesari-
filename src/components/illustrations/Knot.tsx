"use client";

import { motion } from "framer-motion";
import { SPRING_SETTLE, useReducedMotionSafe } from "@/lib/motion";

type Props = { tied?: boolean; className?: string };

export default function Knot({ tied = false, className = "" }: Props) {
  const reduce = useReducedMotionSafe();
  return (
    <motion.svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      aria-hidden
      initial={false}
      animate={{ scale: tied || reduce ? 1 : 0, opacity: tied || reduce ? 1 : 0 }}
      transition={SPRING_SETTLE}
    >
      <path
        d="M12 4 L14.5 9.5 L20.5 10.2 L16 14.2 L17.2 20 L12 17 L6.8 20 L8 14.2 L3.5 10.2 L9.5 9.5 Z"
        strokeLinejoin="round"
      />
    </motion.svg>
  );
}
