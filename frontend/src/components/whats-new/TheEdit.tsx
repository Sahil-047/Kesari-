"use client";

import { useReducedMotionSafe } from "@/lib/motion";
import { SEASON_ARRIVALS, type SeasonArrival } from "@/lib/whats-new";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

const TOTAL = SEASON_ARRIVALS.length;

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

/**
 * One sheet. `v` counts screens scrolled through the stack: sheet i slides in
 * over [i - 1, i] and is covered by the next over [i, i + 1].
 */
function Sheet({
  arrival,
  i,
  v,
}: {
  arrival: SeasonArrival;
  i: number;
  v: MotionValue<number>;
}) {
  const reduce = useReducedMotionSafe();

  // Photo travels slower than its sheet while the sheet slides up.
  const imgY = useTransform(v, (x) =>
    reduce || i === 0 ? "0%" : `${-(1 - clamp01(x - (i - 1))) * 28}%`,
  );
  // Once covered, the sheet sinks back and dims like paper underneath.
  const scale = useTransform(v, (x) =>
    reduce ? 1 : 1 - clamp01(x - i) * 0.08,
  );
  const shade = useTransform(v, (x) => clamp01(x - i) * 0.55);

  return (
    <div
      className="sticky top-0 h-[100svh] w-full"
      style={{ zIndex: i + 1 }}
    >
      <motion.div
        style={{ scale }}
        className="relative h-full w-full origin-top bg-[#efe6d6] p-2 shadow-[0_-24px_50px_-12px_rgba(30,18,6,0.45)] md:p-3"
      >
        <div className="relative h-full w-full overflow-hidden bg-ink">
          <motion.div style={{ y: imgY }} className="absolute inset-x-0 -top-[30%] bottom-0">
            <Image
              src={arrival.image}
              alt={arrival.name}
              fill
              quality={75}
              sizes="100vw"
              className="object-cover object-[50%_30%]"
              priority={i === 0}
            />
          </motion.div>

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-black/35" />

          <div className="section-pad pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-6 pt-6 md:pt-8">
            {i === 0 ? (
              <div>
                <p className="font-sans text-[0.62rem] uppercase tracking-[0.32em] text-cream/70">
                  From the working table
                </p>
                <h2 className="display mt-2 text-[clamp(1.8rem,4.2vw,3.6rem)] uppercase leading-[0.95] tracking-[0.12em] text-cream">
                  The Edit
                </h2>
              </div>
            ) : (
              <span />
            )}
            <span className="font-sans text-[0.6rem] uppercase tracking-[0.3em] text-cream/70">
              No. {arrival.index}
            </span>
          </div>

          <div className="section-pad absolute inset-x-0 bottom-0 flex items-end gap-5 pb-8 md:gap-8 md:pb-12">
            <p
              aria-hidden
              className="display shrink-0 text-[clamp(3.5rem,10vw,9rem)] leading-[0.8] text-transparent [-webkit-text-stroke:1px_rgba(250,244,232,0.55)]"
            >
              {arrival.index}
            </p>
            <div className="min-w-0">
              <p className="font-sans text-[0.6rem] uppercase tracking-[0.28em] text-gold-soft">
                {arrival.craft}
              </p>
              <h3 className="display mt-2 text-[clamp(1.5rem,3.4vw,3.2rem)] uppercase leading-[0.98] tracking-[0.08em] text-cream">
                {arrival.name}
              </h3>
              <Link
                href={`/product/${arrival.slug}`}
                className="group mt-4 inline-flex min-h-11 items-center border border-cream/60 px-5 font-sans text-[0.6rem] uppercase tracking-[0.26em] transition-colors duration-200 hover:bg-cream md:mt-6"
              >
                {/* Colour lives on the span: the global `a { color: inherit }` wins over utilities on the link */}
                <span className="flex items-center gap-3 text-cream transition-colors duration-200 group-hover:text-ink">
                  View piece <span aria-hidden>→</span>
                </span>
              </Link>
            </div>
          </div>
        </div>

        <motion.div
          aria-hidden
          style={{ opacity: shade }}
          className="pointer-events-none absolute inset-0 bg-[#0b0907]"
        />
      </motion.div>
    </div>
  );
}

/** The Edit — the pieces arrive one sheet of paper after another. */
export default function TheEdit() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  // Screens scrolled: 0 at the first sheet, TOTAL once the closing panel has covered the last.
  const v = useTransform(scrollYProgress, (p) => p * TOTAL);

  return (
    <section
      ref={ref}
      aria-label="Season arrivals"
      className="relative z-10 bg-[#0b0907]"
    >
      {SEASON_ARRIVALS.map((a, i) => (
        <Sheet key={a.slug} arrival={a} i={i} v={v} />
      ))}
      {/* One more screen so the closing panel can slide over the last sheet */}
      <div aria-hidden className="h-[100svh]" />
    </section>
  );
}
