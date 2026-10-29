"use client";

import AutoLoopVideo from "@/components/AutoLoopVideo";
import Paisley from "@/components/illustrations/Paisley";
import { FILM } from "@/lib/bridal-collections";
import { SPRING_SCROLL, useReducedMotionSafe } from "@/lib/motion";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export default function FilmInterlude() {
  const ref = useRef<HTMLElement>(null);
  const videoWrap = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotionSafe();
  const [muted, setMuted] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setMounted(true);
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const smooth = useSpring(scrollYProgress, SPRING_SCROLL);
  const width = useTransform(smooth, [0, 0.65], reduce ? ["100%", "100%"] : ["60vw", "100vw"]);
  const barH = useTransform(smooth, [0, 0.65], reduce ? ["0%", "0%"] : ["14%", "0%"]);

  return (
    <section
      ref={ref}
      className="relative z-10 h-[200vh] bg-parchment-light"
      aria-label="The film"
    >
      <div className="sticky top-0 flex h-[100dvh] items-center justify-center overflow-hidden">
        <motion.div
          style={{ height: barH }}
          className="absolute inset-x-0 top-0 z-[2] bg-ink"
        />
        <motion.div
          style={{ height: barH }}
          className="absolute inset-x-0 bottom-0 z-[2] bg-ink"
        />

        <motion.div
          ref={videoWrap}
          style={{ width }}
          className="relative aspect-[2.39/1] max-h-[78vh] overflow-hidden bg-ink"
        >
          <Paisley className="pointer-events-none absolute left-3 top-3 z-[2] h-10 w-8 text-gold/60" />
          <Paisley className="pointer-events-none absolute right-3 top-3 z-[2] h-10 w-8 rotate-90 text-gold/60" />
          <Paisley className="pointer-events-none absolute bottom-3 left-3 z-[2] h-10 w-8 -rotate-90 text-gold/60" />
          <Paisley className="pointer-events-none absolute bottom-3 right-3 z-[2] h-10 w-8 rotate-180 text-gold/60" />

          {mounted ? (
            <AutoLoopVideo
              className="absolute inset-0 h-full w-full object-cover"
              src={FILM.video.src}
              poster={FILM.video.poster}
              aria-label={FILM.caption}
            />
          ) : (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${FILM.video.poster})` }}
            />
          )}

          <div className="absolute inset-x-0 bottom-0 z-[2] flex items-end justify-between p-4 md:p-5">
            <p className="font-sans text-[0.55rem] uppercase tracking-[0.3em] text-cream/75">
              {FILM.caption}
              <span className="ml-3 text-cream/45">00:00</span>
            </p>
            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              className="cursor-pointer font-sans text-[0.55rem] uppercase tracking-[0.28em] text-cream/80 transition-colors hover:text-cream focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-gold"
              aria-pressed={!muted}
            >
              {muted ? "Unmute" : "Mute"}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
