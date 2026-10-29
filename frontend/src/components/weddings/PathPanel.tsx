"use client";

import AutoLoopVideo from "@/components/AutoLoopVideo";
import ScrollWriteText from "@/components/ScrollWriteText";
import Arch from "@/components/illustrations/Arch";
import Toran from "@/components/illustrations/Toran";
import VeilEdge from "@/components/illustrations/VeilEdge";
import type { WEDDING_MOMENTS } from "@/lib/bridal-collections";
import { EASE_VEIL, useReducedMotionSafe } from "@/lib/motion";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

type Moment = (typeof WEDDING_MOMENTS)[number];

export default function PathPanel({
  moment,
  index,
  total,
}: {
  moment: Moment;
  index: number;
  total: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotionSafe();
  const inView = useInView(ref, { amount: 0.55, once: false });
  const lead = moment.images[0];
  const focal = lead.focal
    ? `${lead.focal.x}% ${lead.focal.y}%`
    : "50% 40%";

  return (
    <article
      ref={ref}
      id={`path-${moment.id}`}
      className="relative h-[100dvh] w-screen shrink-0 md:h-full"
    >
      {moment.layout === "triptych" ? (
        <div className="absolute inset-0 grid grid-cols-12 gap-[2vw] bg-parchment-light p-[4vw]">
          <div className="relative col-span-7 overflow-hidden">
            <Image
              src={moment.images[0].src}
              alt={moment.images[0].alt}
              fill
              quality={90}
              sizes="55vw"
              className="object-cover"
              style={{ objectPosition: focal }}
            />
          </div>
          <div className="col-span-5 grid grid-rows-2 gap-[2vw]">
            {moment.images.slice(1, 3).map((img) => (
              <div key={img.src} className="relative overflow-hidden">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  quality={88}
                  sizes="30vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
          <span
            className="pointer-events-none absolute left-[58.5%] top-[20%] h-[60%] w-px bg-gold/55"
            aria-hidden
          />
        </div>
      ) : moment.layout === "arch" ? (
        <div className="absolute inset-0 flex items-center justify-center bg-parchment-light">
          <div className="relative aspect-[3/4] h-[78%] max-w-[min(72vw,520px)] overflow-hidden">
            <div
              className="absolute inset-[6%] overflow-hidden"
              style={{
                clipPath: "ellipse(46% 48% at 50% 52%)",
              }}
            >
              {moment.video && !reduce ? (
                <AutoLoopVideo
                  className="absolute inset-0 h-full w-full object-cover opacity-80"
                  src={moment.video.src}
                  poster={moment.video.poster}
                  aria-label={moment.title}
                />
              ) : (
                <Image
                  src={lead.src}
                  alt={lead.alt}
                  fill
                  quality={90}
                  sizes="60vw"
                  className="object-cover"
                  style={{ objectPosition: focal }}
                />
              )}
            </div>
            <Arch className="pointer-events-none absolute inset-0 h-full w-full text-gold/65" />
          </div>
        </div>
      ) : (
        <div className="absolute inset-0">
          <Image
            src={lead.src}
            alt={lead.alt}
            fill
            priority={index === 0}
            quality={92}
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: focal }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/55 via-ink/15 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-ink/10" />

          {moment.layout === "veil" && !reduce ? (
            <motion.div
              className="absolute inset-0 z-[1] bg-cream/40 backdrop-blur-[1.5px]"
              initial={false}
              animate={{
                clipPath: inView
                  ? "polygon(100% 0, 100% 0, 100% 100%, 100% 100%)"
                  : "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
              }}
              transition={{ duration: 1.1, ease: EASE_VEIL }}
            >
              <VeilEdge className="absolute inset-x-0 bottom-1/3 h-8 w-full text-gold/50" />
            </motion.div>
          ) : null}

          {moment.layout === "fullbleed" ? (
            <div className="pointer-events-none absolute inset-x-0 top-6 z-[2] px-6 text-gold/60 md:top-10 md:px-10">
              <Toran className="mx-auto h-12 w-full max-w-4xl md:h-14" />
            </div>
          ) : null}
        </div>
      )}

      <div className="relative z-[3] flex h-full flex-col justify-between section-pad py-10 md:py-14">
        <div className="flex items-start justify-between gap-6">
          <p className="font-sans text-[0.58rem] uppercase tracking-[0.4em] text-cream/70">
            Soft Bridal · Path
          </p>
          <p className="font-sans text-[0.7rem] tabular-nums tracking-[0.2em] text-cream/80">
            {moment.index}
            <span className="text-cream/40">
              {" "}
              / {String(total).padStart(2, "0")}
            </span>
          </p>
        </div>

        <div className="max-w-3xl pb-16 md:pb-20">
          {inView || reduce ? (
            <ScrollWriteText
              as="h2"
              text={moment.title}
              className={`display text-[clamp(2.8rem,10vw,7.5rem)] uppercase leading-[0.85] tracking-[0.06em] ${
                moment.layout === "triptych" || moment.layout === "arch"
                  ? "text-ink"
                  : "text-cream"
              }`}
            />
          ) : (
            <h2
              className={`display text-[clamp(2.8rem,10vw,7.5rem)] uppercase leading-[0.85] tracking-[0.06em] opacity-0 ${
                moment.layout === "triptych" || moment.layout === "arch"
                  ? "text-ink"
                  : "text-cream"
              }`}
            >
              {moment.title}
            </h2>
          )}
          <p
            className={`mt-5 max-w-md text-[1.05rem] leading-relaxed md:text-[1.1rem] ${
              moment.layout === "triptych" || moment.layout === "arch"
                ? "text-ink-soft"
                : "text-cream/80"
            }`}
          >
            {moment.line}
          </p>
        </div>
      </div>
    </article>
  );
}
