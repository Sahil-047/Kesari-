"use client";

import AutoLoopVideo from "@/components/AutoLoopVideo";
import ArchArcade from "@/components/whats-new/ArchArcade";
import type { WhatsNewContent } from "@/lib/content/pages";
import { EASE_FLUENT, useReducedMotionSafe } from "@/lib/motion";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef, type ReactNode } from "react";

/* ------------------------------------------------------------------ */
/* Hero — video sinks and swells while the title lifts away            */
/* ------------------------------------------------------------------ */

function Hero({ header, hero }: { header: ReactNode; hero: WhatsNewContent["hero"] }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotionSafe();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const videoY = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? ["0%", "0%"] : ["0%", "30%"],
  );
  const videoScale = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? [1, 1] : [1, 1.15],
  );
  const titleY = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? ["0%", "0%"] : ["0%", "-80%"],
  );
  const fade = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const title = hero.title;

  return (
    <section
      ref={ref}
      className="relative h-[100svh] w-full overflow-hidden bg-ink"
    >
      {header}
      <motion.div
        style={{ y: videoY, scale: videoScale }}
        className="absolute inset-0"
      >
        <AutoLoopVideo
          className="h-full w-full object-cover"
          src={hero.video}
          poster={hero.poster}
          aria-label={hero.title}
        />
      </motion.div>
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-ink/75 via-ink/15 to-ink/25" />

      <motion.div
        style={{ y: titleY, opacity: fade }}
        className="section-pad absolute inset-x-0 bottom-0 z-[2] pb-12 text-cream md:pb-16"
      >
        <div className="mx-auto flex max-w-[1680px] items-end justify-between gap-6">
          <div>
            <motion.p
              className="font-sans text-[0.6rem] uppercase tracking-[0.36em] text-cream/85"
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: EASE_FLUENT }}
            >
              {hero.eyebrow}
            </motion.p>
            <h1
              aria-label={title}
              className="display mt-3 flex text-[clamp(2.8rem,10vw,8rem)] uppercase leading-[0.9] tracking-[0.08em]"
            >
              {title.split("").map((ch, i) => (
                <span
                  key={i}
                  aria-hidden
                  className="inline-block overflow-hidden"
                >
                  <motion.span
                    className="inline-block"
                    initial={reduce ? false : { y: "105%" }}
                    animate={{ y: "0%" }}
                    transition={{
                      duration: 1,
                      delay: 0.3 + i * 0.05,
                      ease: EASE_FLUENT,
                    }}
                  >
                    {ch === " " ? " " : ch}
                  </motion.span>
                </span>
              ))}
            </h1>
          </div>

          <div
            aria-hidden
            className="hidden flex-col items-center gap-3 font-sans text-[0.55rem] uppercase tracking-[0.32em] text-cream/70 md:flex"
          >
            Scroll
            <span className="relative block h-14 w-px overflow-hidden bg-cream/25">
              <motion.span
                className="absolute inset-x-0 top-0 h-1/2 bg-cream"
                animate={reduce ? undefined : { y: ["-100%", "200%"] }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Closing — a full-screen panel slides up over The Edit                */
/* ------------------------------------------------------------------ */

type Silhouette = WhatsNewContent["silhouettes"]["items"][number];

/** Each panel's photo drifts at its own speed as the cover slides up. */
const DRIFTS = ["-14%", "-26%", "-8%", "-18%"];

function SilhouettePanel({
  item,
  index,
  progress,
}: {
  item: Silhouette;
  index: number;
  progress: MotionValue<number>;
}) {
  const reduce = useReducedMotionSafe();
  const y = useTransform(
    progress,
    [0, 1],
    reduce ? ["0%", "0%"] : [DRIFTS[index % DRIFTS.length]!, "0%"],
  );

  return (
    <Link
      href={item.link || "#"}
      className="group relative min-h-0 flex-1 overflow-hidden outline-none transition-[flex-grow] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold md:hover:flex-[1.6] md:focus-visible:flex-[1.6]"
    >
      <motion.div
        style={{ y }}
        className="absolute inset-x-0 -top-[28%] bottom-0"
      >
        <Image
          src={item.image}
          alt=""
          fill
          quality={88}
          sizes="(max-width:768px) 100vw, 45vw"
          className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
        />
      </motion.div>
      <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/30 transition-opacity duration-500 group-hover:opacity-80" />

      <span className="absolute left-5 top-5 font-sans text-[0.58rem] tracking-[0.32em] text-cream/75 md:left-8 md:top-28">
        0{index + 1}
      </span>

      <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 md:p-8">
        <span className="min-w-0">
          <span className="display block text-[clamp(1.8rem,4vw,3.6rem)] uppercase leading-[0.95] tracking-[0.08em] text-cream">
            {item.label}
          </span>
          <span className="mt-2 block max-w-[16rem] font-sans text-[0.58rem] uppercase leading-relaxed tracking-[0.24em] text-cream/70">
            {item.line}
          </span>
        </span>
        <span
          aria-hidden
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-cream/50 text-cream transition-colors duration-200 group-hover:border-gold group-hover:bg-gold group-hover:text-ink"
        >
          →
        </span>
      </span>
    </Link>
  );
}

function Closing({ content }: { content: WhatsNewContent["silhouettes"] }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start start"],
  });

  return (
    <section
      ref={ref}
      aria-label="Shop by silhouette"
      className="relative z-20 -mt-[100svh] h-[100svh] overflow-hidden bg-[#0b0907] shadow-[0_-40px_80px_rgba(20,12,4,0.45)]"
    >
      <div className="flex h-full flex-col gap-px md:flex-row">
        {content.items.map((item, i) => (
          <SilhouettePanel
            key={`${item.label}-${i}`}
            item={item}
            index={i}
            progress={scrollYProgress}
          />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center pt-6 md:pt-10">
        <p className="bg-[#0b0907]/70 px-4 py-2 font-sans text-[0.6rem] uppercase tracking-[0.36em] text-cream/85 backdrop-blur-sm">
          {content.label}
        </p>
      </div>
    </section>
  );
}

export default function WhatsNewExperience({
  header,
  content,
}: {
  header: ReactNode;
  content: WhatsNewContent;
}) {
  return (
    <>
      <Hero header={header} hero={content.hero} />
      <ArchArcade content={content.edit} />
      <Closing content={content.silhouettes} />
    </>
  );
}
