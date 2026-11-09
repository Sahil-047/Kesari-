"use client";

import type { WeddingsContent } from "@/lib/content/pages";
import { EASE_FLUENT, SPRING_SCROLL, useReducedMotionSafe } from "@/lib/motion";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function Threshold({ content }: { content: WeddingsContent["closing"] }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotionSafe();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setMounted(true);
      },
      { rootMargin: "180px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const smooth = useSpring(scrollYProgress, SPRING_SCROLL);

  const imageY = useTransform(smooth, [0, 1], reduce ? ["0%", "0%"] : ["-12%", "12%"]);
  const imageScale = useTransform(smooth, [0, 1], reduce ? [1, 1] : [1.12, 1]);
  const overlayOpacity = useTransform(smooth, [0.15, 0.45, 0.85], [0.45, 0.28, 0.5]);

  if (!content.image && !content.line) return null;

  return (
    <section
      ref={ref}
      className="relative z-10 h-[160vh] bg-ink"
      aria-label="The threshold"
    >
      <div className="sticky top-0 h-[100dvh] overflow-hidden">
        {mounted && content.image ? (
          <motion.div
            className="absolute inset-[-14%] will-change-transform"
            style={{ y: imageY, scale: imageScale }}
          >
            <Image
              src={content.image}
              alt=""
              fill
              quality={92}
              sizes="100vw"
              className="object-cover object-[50%_28%]"
            />
          </motion.div>
        ) : null}

        <motion.div
          className="absolute inset-0 bg-ink"
          style={{ opacity: overlayOpacity }}
        />

        <div className="absolute inset-x-0 bottom-0 z-[2] bg-gradient-to-t from-ink/85 via-ink/40 to-transparent pt-28 section-pad pb-14 text-center md:pb-20">
          {content.line ? (
            <motion.p
              className="display mx-auto max-w-2xl text-[clamp(1.4rem,3.5vw,2.6rem)] uppercase leading-[1.15] tracking-[0.12em] text-cream drop-shadow-[0_2px_18px_rgba(0,0,0,0.45)]"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.8, ease: EASE_FLUENT }}
            >
              {content.line}
            </motion.p>
          ) : null}
          {content.ctaLabel && content.ctaHref ? (
            <motion.div
              className="mt-8 md:mt-10"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.7, delay: 0.12, ease: EASE_FLUENT }}
            >
              <Link
                href={content.ctaHref}
                className="group inline-flex min-h-12 items-center justify-center gap-3 border border-gold bg-gold px-8 py-3.5 font-sans text-[0.72rem] uppercase tracking-[0.28em] text-ink shadow-[0_10px_40px_rgba(0,0,0,0.35)] transition-colors duration-200 hover:bg-cream hover:border-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold sm:min-h-14 sm:px-12 sm:text-[0.8rem] sm:tracking-[0.3em]"
              >
                {content.ctaLabel}
                <span
                  aria-hidden
                  className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </motion.div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
