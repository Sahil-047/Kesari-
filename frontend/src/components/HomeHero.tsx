"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { HOME_SHOWCASE } from "@/lib/data";
import AutoLoopVideo from "./AutoLoopVideo";
import Header from "./Header";

const hero = HOME_SHOWCASE[0];

export default function HomeHero() {
  return (
    <section className="relative aspect-video w-full overflow-hidden md:min-h-[56dvh]">
      <AutoLoopVideo
        className="absolute inset-0 h-full w-full object-cover"
        src={hero.video}
        poster={hero.videoPoster}
        aria-label={hero.title}
      />
      <Header variant="overlay" />

      <div className="absolute inset-0 z-[2] flex items-end justify-center pb-[10%] text-white md:pb-[12%]">
        <motion.div
          className="flex flex-col items-center text-center drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="font-sans text-[0.6rem] uppercase tracking-[0.35em] text-white/90">
            {hero.eyebrow}
          </p>
          <h1 className="display mt-3 text-[clamp(1.75rem,4.5vw,3rem)] uppercase tracking-[0.18em]">
            {hero.title}
          </h1>
          <Link
            href={hero.href}
            className="ghost-btn mt-8 px-14 py-4.5 text-[0.95rem] tracking-[0.34em] md:px-16 md:py-5 md:text-[1.05rem]"
          >
            Explore
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
