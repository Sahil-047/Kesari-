"use client";

import type { Media } from "@/lib/bridal-collections";
import { SPRING_SETTLE, useReducedMotionSafe } from "@/lib/motion";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const SIZE = 160;
const ZOOM = 2.2;

export default function DetailLoupe({
  media,
  enabled,
}: {
  media: Media;
  enabled: boolean;
}) {
  const reduce = useReducedMotionSafe();
  const host = useRef<HTMLDivElement>(null);
  const [fine, setFine] = useState(false);
  const [on, setOn] = useState(false);
  const [bgPos, setBgPos] = useState("50% 50%");
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, SPRING_SETTLE);
  const y = useSpring(my, SPRING_SETTLE);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setFine(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (!enabled || reduce || !fine) return null;

  return (
    <div
      ref={host}
      className="absolute inset-0 z-[4] hidden cursor-none md:block"
      onMouseEnter={() => setOn(true)}
      onMouseLeave={() => setOn(false)}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const lx = e.clientX - rect.left;
        const ly = e.clientY - rect.top;
        mx.set(lx - SIZE / 2);
        my.set(ly - SIZE / 2);
        const px = Math.max(0, Math.min(100, (lx / rect.width) * 100));
        const py = Math.max(0, Math.min(100, (ly / rect.height) * 100));
        setBgPos(`${px}% ${py}%`);
      }}
    >
      <motion.div
        className="pointer-events-none absolute overflow-hidden rounded-full border border-gold shadow-[0_0_0_1px_rgba(197,160,89,0.2)]"
        style={{
          x,
          y,
          width: SIZE,
          height: SIZE,
          opacity: on ? 1 : 0,
          backgroundImage: `url(${media.src})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: `${ZOOM * 100}%`,
          backgroundPosition: bgPos,
        }}
        aria-hidden
      />
    </div>
  );
}
