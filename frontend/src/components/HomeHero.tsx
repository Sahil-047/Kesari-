"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { HomeContent } from "@/lib/content/pages";
import AutoLoopVideo from "./AutoLoopVideo";
import Header from "./Header";

export default function HomeHero({ hero }: { hero: HomeContent["hero"] }) {
  return (
    <section className="film-hero">
      <AutoLoopVideo
        className="absolute inset-0 h-full w-full object-cover"
        src={hero.video}
        poster={hero.poster}
        aria-label={hero.title}
      />
      <Header variant="overlay" />

      <div className="absolute inset-0 z-[2] flex items-end justify-center px-4 pb-[12%] text-white sm:px-6 md:pb-[12%]">
        <motion.div
          className="flex max-w-[min(36rem,100%)] flex-col items-center text-center drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="font-sans text-[0.58rem] uppercase tracking-[0.28em] text-white/90 sm:text-[0.6rem] sm:tracking-[0.35em]">
            {hero.eyebrow}
          </p>
          <h1 className="display mt-3 text-[clamp(1.45rem,6.5vw,3rem)] uppercase tracking-[0.14em] sm:tracking-[0.18em]">
            {hero.title}
          </h1>
          <Link
            href={hero.link || "/products"}
            className="ghost-btn mt-6 text-[0.8rem] tracking-[0.28em] sm:mt-8 sm:px-14 sm:py-4.5 sm:text-[0.95rem] sm:tracking-[0.34em] md:px-16 md:py-5 md:text-[1.05rem]"
          >
            Explore
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
