"use client";

import Doors from "@/components/illustrations/Doors";
import Knot from "@/components/illustrations/Knot";
import { THRESHOLD } from "@/lib/bridal-collections";
import { EASE_FLUENT, SPRING_SCROLL, useReducedMotionSafe } from "@/lib/motion";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function Threshold() {
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
    offset: ["start start", "end end"],
  });
  const smooth = useSpring(scrollYProgress, SPRING_SCROLL);

  const leftRot = useTransform(smooth, [0.25, 0.75], reduce ? [0, 0] : [0, -80]);
  const rightRot = useTransform(smooth, [0.25, 0.75], reduce ? [0, 0] : [0, 80]);
  const knotTied = useTransform(smooth, (v) => v > 0.18);
  const [tied, setTied] = useState(!!reduce);

  useEffect(() => {
    if (reduce) {
      setTied(true);
      return;
    }
    return knotTied.on("change", (v) => setTied(v));
  }, [knotTied, reduce]);

  const focal = THRESHOLD.image.focal
    ? `${THRESHOLD.image.focal.x}% ${THRESHOLD.image.focal.y}%`
    : "50% 30%";

  return (
    <section
      ref={ref}
      className="relative z-10 h-[200vh] bg-ink"
      aria-label="The threshold"
    >
      <div
        className="sticky top-0 h-[100dvh] overflow-hidden"
        style={{ perspective: "1600px" }}
      >
        {mounted ? (
          <Image
            src={THRESHOLD.image.src}
            alt={THRESHOLD.image.alt}
            fill
            quality={92}
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: focal }}
          />
        ) : null}
        <div className="absolute inset-0 bg-ink/25" />

        {/* Doors */}
        <div className="absolute inset-0 z-[2] flex">
          <motion.div
            className="relative h-full w-1/2 origin-left bg-ink text-gold/65"
            style={{
              rotateY: reduce ? 0 : leftRot,
              transformStyle: "preserve-3d",
            }}
          >
            <Doors className="absolute inset-0 h-full w-[200%] object-cover" />
          </motion.div>
          <motion.div
            className="relative h-full w-1/2 origin-right bg-ink text-gold/65"
            style={{
              rotateY: reduce ? 0 : rightRot,
              transformStyle: "preserve-3d",
            }}
          >
            <Doors className="absolute inset-0 -left-full h-full w-[200%]" />
          </motion.div>
        </div>

        <div className="absolute left-1/2 top-[48%] z-[3] -translate-x-1/2 -translate-y-1/2 text-gold">
          <Knot tied={tied} className="h-7 w-7" />
        </div>

        <div className="absolute inset-x-0 bottom-0 z-[4] section-pad pb-14 text-center md:pb-20">
          <motion.p
            className="display mx-auto max-w-2xl text-[clamp(1.4rem,3.5vw,2.6rem)] uppercase leading-[1.15] tracking-[0.12em] text-cream"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.8, ease: EASE_FLUENT }}
          >
            {THRESHOLD.line}
          </motion.p>
          <Link
            href={THRESHOLD.cta.href}
            className="group mt-8 inline-block font-sans text-[0.62rem] uppercase tracking-[0.32em] text-cream/85 transition-colors hover:text-cream focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-gold"
          >
            {THRESHOLD.cta.label}
            <span className="mt-2 block h-px w-full origin-left scale-x-0 bg-gold transition-transform duration-300 group-hover:scale-x-100" />
          </Link>
        </div>
      </div>
    </section>
  );
}
