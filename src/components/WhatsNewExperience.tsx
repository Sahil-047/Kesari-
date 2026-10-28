"use client";

import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useRef, useState, type ReactNode } from "react";
import { COLOR_COLLECTIONS } from "@/lib/color-collections";
import {
  ARRIVAL_SPANS,
  SEASON_ARRIVALS,
  type SeasonArrival,
} from "@/lib/whats-new";

const EASE = [0.22, 1, 0.36, 1] as const;

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2, margin: "0px 0px -6% 0px" }}
      transition={{ duration: 0.8, delay: reduce ? 0 : delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

function ArrivalCard({
  arrival,
  span,
  featured = false,
  delay = 0,
}: {
  arrival: SeasonArrival;
  span: string;
  featured?: boolean;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const [hot, setHot] = useState(false);

  return (
    <Reveal delay={delay} className={`col-span-1 ${span}`}>
      <Link
        href={`/product/${arrival.slug}`}
        className={`group relative block h-full min-h-[52vw] overflow-hidden bg-parchment-deep/25 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-ink sm:min-h-[280px] ${
          featured ? "md:min-h-full" : "md:min-h-[340px]"
        }`}
        onMouseEnter={() => setHot(true)}
        onMouseLeave={() => setHot(false)}
        onFocus={() => setHot(true)}
        onBlur={() => setHot(false)}
      >
        <motion.div
          className="absolute inset-0"
          animate={
            reduce
              ? undefined
              : { scale: hot ? 1.06 : 1, x: hot ? "1%" : "0%" }
          }
          transition={{ duration: 0.85, ease: EASE }}
        >
          <Image
            src={arrival.image}
            alt={arrival.name}
            fill
            quality={90}
            sizes="(max-width:768px) 100vw, 55vw"
            className="object-cover"
          />
        </motion.div>

        <span className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/15 to-ink/5 opacity-90 transition-opacity duration-300 group-hover:opacity-100" />

        <span className="absolute left-4 top-4 font-sans text-[0.58rem] uppercase tracking-[0.32em] text-cream/70 md:left-5 md:top-5">
          {arrival.index}
        </span>

        <span className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 p-4 md:p-6">
          <span className="font-sans text-[0.55rem] uppercase tracking-[0.28em] text-cream/65">
            {arrival.craft}
          </span>
          <span className="display text-[clamp(1.15rem,2.4vw,1.85rem)] uppercase leading-tight tracking-[0.12em] text-cream">
            {arrival.name}
          </span>
          <span
            className={`mt-2 inline-flex items-center gap-2 font-sans text-[0.55rem] uppercase tracking-[0.28em] text-cream/90 transition-all duration-300 ${
              hot ? "translate-x-0 opacity-100" : "md:-translate-x-1 md:opacity-0"
            }`}
          >
            View piece
            <span className="inline-block h-px w-7 bg-current" aria-hidden />
          </span>
        </span>
      </Link>
    </Reveal>
  );
}

function ArrivalsBoard() {
  return (
    <section
      className="relative z-10 py-12 md:py-20"
      aria-label="Season arrivals"
    >
      <div className="section-pad mx-auto mb-8 max-w-[1680px] md:mb-12">
        <Reveal>
          <p className="font-sans text-[0.6rem] uppercase tracking-[0.32em] text-ink/55">
            From the working table
          </p>
          <h2 className="display mt-2 text-[clamp(1.75rem,4vw,3rem)] uppercase tracking-[0.14em] text-ink">
            Nine arrivals
          </h2>
        </Reveal>
      </div>

      <div className="section-pad mx-auto max-w-[1680px]">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:auto-rows-[minmax(200px,auto)] md:grid-cols-12 md:gap-4">
          {SEASON_ARRIVALS.map((arrival, i) => (
            <ArrivalCard
              key={arrival.slug}
              arrival={arrival}
              span={ARRIVAL_SPANS[i] ?? "md:col-span-4"}
              featured={i === 0 || i === 4 || i === 8}
              delay={Math.min(i * 0.05, 0.35)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ColourLane() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const x = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? ["0%", "0%"] : ["4%", "-18%"],
  );

  return (
    <section
      ref={ref}
      className="relative z-10 overflow-hidden pb-16 pt-6 md:pb-28 md:pt-10"
      aria-label="Colour stories"
    >
      <div className="section-pad mx-auto mb-8 max-w-[1680px] md:mb-12">
        <Reveal>
          <p className="font-sans text-[0.6rem] uppercase tracking-[0.32em] text-ink/55">
            Season colour
          </p>
          <h2 className="display mt-2 text-[clamp(1.75rem,4vw,3rem)] uppercase tracking-[0.14em] text-ink">
            The lane
          </h2>
        </Reveal>
      </div>

      <motion.div style={{ x }} className="flex w-max gap-4 px-4 md:gap-6 md:px-8">
        {COLOR_COLLECTIONS.map((col, i) => (
          <Reveal
            key={col.title}
            delay={i * 0.06}
            className="relative w-[78vw] max-w-[520px] shrink-0 md:w-[42vw]"
          >
            <Link
              href={col.href ?? "/womenswear"}
              className="group relative block aspect-[3/4] overflow-hidden bg-parchment-deep/30 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-ink"
            >
              <Image
                src={col.images[0].src}
                alt={col.title}
                fill
                quality={90}
                sizes="42vw"
                className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.05] motion-reduce:transition-none"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-transparent" />
              <span
                className="absolute left-0 top-0 h-1 w-full"
                style={{ backgroundColor: col.accent }}
                aria-hidden
              />
              <span className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-5 md:p-7">
                <span className="font-sans text-[0.55rem] uppercase tracking-[0.3em] text-cream/65">
                  {col.label}
                </span>
                <span className="display text-[clamp(1.35rem,3vw,2.1rem)] uppercase tracking-[0.12em] text-cream">
                  {col.title}
                </span>
                <span className="mt-1 inline-flex items-center gap-2 font-sans text-[0.55rem] uppercase tracking-[0.28em] text-cream/85 opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:opacity-90">
                  Enter colour
                  <span className="inline-block h-px w-6 bg-current" />
                </span>
              </span>
            </Link>
          </Reveal>
        ))}
      </motion.div>
    </section>
  );
}

function IndexStrip() {
  const reduce = useReducedMotion();

  return (
    <section className="relative z-10 border-t border-ink/10 py-10 md:py-14">
      <div className="section-pad mx-auto max-w-[1680px]">
        <ul className="divide-y divide-ink/10">
          {SEASON_ARRIVALS.map((arrival, i) => (
            <motion.li
              key={arrival.slug}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{
                duration: 0.55,
                delay: reduce ? 0 : i * 0.04,
                ease: EASE,
              }}
            >
              <Link
                href={`/product/${arrival.slug}`}
                className="group flex cursor-pointer items-baseline gap-4 py-4 transition-colors duration-200 hover:text-ink md:gap-8 md:py-5"
              >
                <span className="w-10 shrink-0 font-sans text-[0.58rem] uppercase tracking-[0.28em] text-ink/40 group-hover:text-gold">
                  {arrival.index}
                </span>
                <span className="display min-w-0 flex-1 text-[clamp(1.05rem,2.2vw,1.65rem)] uppercase tracking-[0.12em] text-ink">
                  {arrival.name}
                </span>
                <span className="hidden shrink-0 font-sans text-[0.55rem] uppercase tracking-[0.28em] text-ink/45 sm:block">
                  {arrival.category}
                </span>
                <span
                  className="hidden h-px w-0 bg-ink transition-all duration-300 group-hover:w-10 md:block"
                  aria-hidden
                />
              </Link>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default function WhatsNewExperience() {
  return (
    <>
      <ArrivalsBoard />
      <ColourLane />
      <IndexStrip />
    </>
  );
}
