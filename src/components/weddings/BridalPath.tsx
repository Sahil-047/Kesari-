"use client";

import Knot from "@/components/illustrations/Knot";
import PathPanel from "@/components/weddings/PathPanel";
import { WEDDING_MOMENTS } from "@/lib/bridal-collections";
import { SPRING_SCROLL, useReducedMotionSafe } from "@/lib/motion";
import {
  motion,
  useMotionTemplate,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { useRef, useState } from "react";

const COUNT = WEDDING_MOMENTS.length;

export default function BridalPath() {
  const containerRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotionSafe();
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  const smooth = useSpring(scrollYProgress, SPRING_SCROLL);

  const x = useTransform(
    smooth,
    [0, 1],
    reduce ? ["0vw", "0vw"] : ["0vw", `-${(COUNT - 1) * 100}vw`],
  );
  const progressWidth = useTransform(smooth, [0, 1], ["0%", "100%"]);
  const threadLength = useTransform(smooth, [0, 1], [0, 1]);

  const velocity = useVelocity(smooth);
  const blurRaw = useTransform(velocity, (v) =>
    reduce ? 0 : Math.min(1.6, Math.abs(v) * 95),
  );
  const blurPx = useSpring(blurRaw, { stiffness: 260, damping: 34, mass: 0.18 });
  const filter = useMotionTemplate`blur(${blurPx}px)`;

  useMotionValueEvent(smooth, "change", (v) => {
    setActive(
      Math.min(COUNT - 1, Math.max(0, Math.round(v * (COUNT - 1)))),
    );
  });

  const jump = (i: number) => {
    const el = containerRef.current;
    if (!el) return;
    const top = window.scrollY + el.getBoundingClientRect().top;
    const travel = el.offsetHeight - window.innerHeight;
    window.scrollTo({
      top: top + (i / Math.max(COUNT - 1, 1)) * travel,
      behavior: reduce ? "auto" : "smooth",
    });
  };

  if (reduce) {
    return (
      <section
        ref={containerRef}
        className="relative z-10 bg-parchment-light"
        aria-label="Bridal path"
      >
        <a href="#look-manifests" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-cream focus:px-3 focus:py-2 focus:text-ink">
          Skip bridal path
        </a>
        {WEDDING_MOMENTS.map((m, i) => (
          <PathPanel key={m.id} moment={m} index={i} total={COUNT} />
        ))}
      </section>
    );
  }

  return (
    <section
      ref={containerRef}
      className="relative z-10 bg-parchment-light md:h-[580vh]"
      aria-label="Bridal path"
    >
      <a
        href="#look-manifests"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-cream focus:px-3 focus:py-2 focus:text-ink focus:outline focus:outline-1 focus:outline-gold"
      >
        Skip bridal path
      </a>

      {/* Mobile: vertical stack */}
      <div className="md:hidden">
        {WEDDING_MOMENTS.map((m, i) => (
          <PathPanel key={`m-${m.id}`} moment={m} index={i} total={COUNT} />
        ))}
      </div>

      {/* Desktop: horizontal scrub */}
      <div className="sticky top-0 hidden h-[100dvh] overflow-hidden md:block">
        <motion.div
          style={{ x, filter }}
          className="flex h-full will-change-[transform,filter]"
        >
          {WEDDING_MOMENTS.map((m, i) => (
            <PathPanel key={m.id} moment={m} index={i} total={COUNT} />
          ))}
        </motion.div>

        {/* Horizontal gold thread + knots */}
        <div className="pointer-events-none absolute inset-x-0 top-[72%] z-[4] section-pad">
          <div className="relative mx-auto h-px max-w-[1680px] bg-cream/20">
            <motion.div
              className="absolute inset-y-0 left-0 origin-left bg-gold"
              style={{ scaleX: threadLength }}
            />
            {WEDDING_MOMENTS.map((m, i) => (
              <div
                key={m.id}
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 text-gold"
                style={{ left: `${(i / Math.max(COUNT - 1, 1)) * 100}%` }}
              >
                <Knot tied={active >= i} className="h-4 w-4" />
              </div>
            ))}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] section-pad pb-6 md:pb-8">
          <div className="mx-auto flex max-w-[1680px] items-end justify-between gap-6">
            <ul className="pointer-events-auto flex gap-6">
              {WEDDING_MOMENTS.map((m, i) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => jump(i)}
                    className={`cursor-pointer font-sans text-[0.55rem] uppercase tracking-[0.28em] transition-colors duration-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-gold ${
                      active === i ? "text-cream" : "text-cream/45 hover:text-cream/70"
                    }`}
                  >
                    {m.title}
                  </button>
                </li>
              ))}
            </ul>
            <div className="w-full max-w-[14rem]">
              <div className="h-px w-full bg-cream/25">
                <motion.div className="h-px bg-gold" style={{ width: progressWidth }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
