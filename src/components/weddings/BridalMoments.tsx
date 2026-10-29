"use client";

import ScrollWriteText from "@/components/ScrollWriteText";
import { WEDDING_MOMENTS } from "@/lib/bridal-collections";
import { EASE_FLUENT, useReducedMotionSafe } from "@/lib/motion";
import { AnimatePresence, motion, useInView } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const CYCLE_MS = 6000;

export default function BridalMoments() {
  const reduce = useReducedMotionSafe();
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { amount: 0.4 });
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  // Auto-advance while the section is on screen and nobody is interacting.
  useEffect(() => {
    if (reduce || paused || !inView) return;
    const t = setTimeout(
      () => setActive((a) => (a + 1) % WEDDING_MOMENTS.length),
      CYCLE_MS,
    );
    return () => clearTimeout(t);
  }, [active, paused, inView, reduce]);

  return (
    <section
      ref={sectionRef}
      className="relative z-10 bg-parchment-light py-10 md:py-14"
      aria-label="Bridal moments"
    >
      <div className="section-pad mx-auto max-w-[1680px]">
        <div className="mb-5 md:mb-7">
          <p className="font-sans text-[0.58rem] uppercase tracking-[0.32em] text-ink/45">
            The evening, in four moments
          </p>
          <ScrollWriteText
            as="h2"
            text="Bridal Moments"
            className="display mt-2 text-[clamp(1.9rem,4vw,3.5rem)] uppercase leading-[0.95] tracking-[0.1em] text-ink"
          />
        </div>

        <div
          className="flex h-[88svh] flex-col gap-2 md:h-[78vh] md:max-h-[860px] md:flex-row md:gap-3"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          {WEDDING_MOMENTS.map((moment, i) => {
            const lead = moment.images[0];
            const focal = lead.focal
              ? `${lead.focal.x}% ${lead.focal.y}%`
              : "50% 35%";
            const isActive = i === active;

            return (
              <motion.button
                key={moment.id}
                type="button"
                onClick={() => setActive(i)}
                onMouseEnter={() => setActive(i)}
                aria-pressed={isActive}
                aria-label={`${moment.index} ${moment.title}`}
                className="group relative min-h-[64px] min-w-0 overflow-hidden text-left outline-none focus-visible:ring-2 focus-visible:ring-gold md:min-h-0 md:min-w-[72px]"
                style={{
                  flexGrow: isActive ? 6 : 1,
                  flexBasis: 0,
                  transition: reduce
                    ? undefined
                    : "flex-grow 0.85s cubic-bezier(0.22,1,0.36,1)",
                }}
                initial={reduce ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.7,
                  delay: reduce ? 0 : i * 0.08,
                  ease: EASE_FLUENT,
                }}
              >
                <Image
                  src={lead.src}
                  alt={lead.alt}
                  fill
                  quality={90}
                  sizes="(max-width:768px) 100vw, 70vw"
                  className={`object-cover transition-[transform,filter] duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isActive
                      ? "scale-100 saturate-100"
                      : "scale-110 saturate-[0.55] group-hover:saturate-100"
                  }`}
                  style={{ objectPosition: focal }}
                  priority={i === 0}
                />

                {moment.video && isActive && !reduce && (
                  <video
                    className="absolute inset-0 h-full w-full object-cover"
                    src={moment.video.src}
                    poster={moment.video.poster}
                    autoPlay
                    muted
                    loop
                    playsInline
                    aria-hidden
                  />
                )}

                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1c140c]/80 via-[#1c140c]/15 to-transparent transition-opacity duration-700 ${
                    isActive ? "opacity-100" : "opacity-60"
                  }`}
                />
                <div
                  className={`pointer-events-none absolute inset-0 bg-[#1c140c] transition-opacity duration-700 ${
                    isActive ? "opacity-0" : "opacity-35 group-hover:opacity-15"
                  }`}
                />

                {/* Collapsed label: horizontal strip on mobile, vertical spine on desktop */}
                <div
                  className={`absolute inset-0 flex items-center gap-3 px-4 transition-opacity duration-500 md:flex-col md:justify-between md:px-0 md:py-6 ${
                    isActive ? "opacity-0" : "opacity-100"
                  }`}
                >
                  <span className="font-sans text-[0.6rem] tracking-[0.3em] text-cream/80">
                    {moment.index}
                  </span>
                  <span className="display text-[0.95rem] uppercase tracking-[0.22em] text-cream md:[writing-mode:vertical-rl] md:rotate-180">
                    {moment.title}
                  </span>
                </div>

                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      key="copy"
                      className="absolute inset-x-0 bottom-0 p-5 md:p-9"
                      initial={reduce ? false : { opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, transition: { duration: 0.2 } }}
                      transition={{ duration: 0.7, delay: 0.25, ease: EASE_FLUENT }}
                    >
                      <p className="font-sans text-[0.6rem] uppercase tracking-[0.32em] text-cream/70">
                        {moment.index} / 0{WEDDING_MOMENTS.length}
                      </p>
                      <h3 className="display mt-2 text-[clamp(1.8rem,4vw,3.75rem)] uppercase leading-[0.95] tracking-[0.1em] text-cream">
                        {moment.title}
                      </h3>
                      <p className="mt-3 max-w-md text-[0.98rem] leading-relaxed text-cream/85 md:text-[1.05rem]">
                        {moment.line}
                      </p>

                      {!reduce && (
                        <div className="mt-5 h-px w-full max-w-xs bg-cream/25">
                          <motion.div
                            key={`${active}-${paused}-${inView}`}
                            className="h-full origin-left bg-cream"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: paused || !inView ? 0 : 1 }}
                            transition={{
                              duration: paused || !inView ? 0 : CYCLE_MS / 1000,
                              ease: "linear",
                            }}
                          />
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
