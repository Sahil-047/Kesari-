"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { EASE_FLUENT, LETTER_BLOOM, useReducedMotionSafe } from "@/lib/motion";

type Props = {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "p" | "span";
  stagger?: number;
  amount?: number;
};

export default function ScrollWriteText({
  text,
  className = "",
  as = "h2",
  stagger = LETTER_BLOOM.stagger,
  amount = LETTER_BLOOM.amount,
}: Props) {
  const ref = useRef<HTMLHeadingElement>(null);
  const reduce = useReducedMotionSafe();
  const inView = useInView(ref, { once: true, amount });
  const chars = Array.from(text);

  const shared = {
    ref,
    className,
    "aria-label": text,
    initial: "hidden" as const,
    animate: (inView ? "show" : "hidden") as "show" | "hidden",
    variants: {
      hidden: {},
      show: {
        transition: {
          staggerChildren: reduce ? 0 : stagger,
          delayChildren: reduce ? 0 : 0.05,
        },
      },
    },
  };

  const letters = chars.map((char, i) => (
    <motion.span
      key={`${char}-${i}`}
      aria-hidden
      className="inline-block will-change-[transform,opacity,filter]"
      style={{ width: char === " " ? "0.35em" : undefined }}
      variants={{
        hidden: reduce
          ? { opacity: 0 }
          : {
              opacity: 0,
              y: LETTER_BLOOM.yFrom,
              filter: `blur(${LETTER_BLOOM.blurFrom}px)`,
            },
        show: reduce
          ? {
              opacity: 1,
              transition: { duration: 0.3 },
            }
          : {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transition: {
                duration: LETTER_BLOOM.duration,
                ease: EASE_FLUENT,
              },
            },
      }}
    >
      {char === " " ? "\u00a0" : char}
    </motion.span>
  ));

  if (as === "h1") return <motion.h1 {...shared}>{letters}</motion.h1>;
  if (as === "p") return <motion.p {...shared}>{letters}</motion.p>;
  if (as === "span") return <motion.span {...shared}>{letters}</motion.span>;
  return <motion.h2 {...shared}>{letters}</motion.h2>;
}
