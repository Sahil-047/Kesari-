"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

/** Landscape (horizontal) — women only, no men */
const SLIDES = [
  "/images/PINK/DSC05834.jpg",
  "/images/ORANGE/DSC05585.jpg",
  "/images/ORANGE/DSC05603.jpg",
  "/images/VIOLET/DSC06461.jpg",
  "/images/VIOLET/DSC06518.jpg",
  "/images/soft-bridal/insight-1.jpg",
  "/images/Wedding/DSC05056.jpg",
  "/images/Wedding/DSC05170.jpg",
  "/images/Wedding/DSC05171.jpg",
  "/images/Wedding/DSC05186.jpg",
];

export default function WomensHeroCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, 3000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section
      className="relative min-h-[70dvh] w-full overflow-hidden md:min-h-[78dvh]"
      aria-roledescription="carousel"
      aria-label="Womenswear"
    >
      <AnimatePresence mode="sync" initial={false}>
        <motion.div
          key={SLIDES[index]}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            src={SLIDES[index]}
            alt=""
            fill
            priority={index === 0}
            quality={100}
            sizes="100vw"
            className="object-cover object-center"
          />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 z-[1] bg-black/25" />
    </section>
  );
}
