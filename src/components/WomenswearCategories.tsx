"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  COLOR_COLLECTIONS,
  WOMENS_CATEGORIES,
  type WomensCategory,
} from "@/lib/color-collections";

const EASE = [0.22, 1, 0.36, 1] as const;

type Props = {
  active: WomensCategory | "all";
  onChange: (next: WomensCategory | "all") => void;
};

export default function WomenswearCategories({ active, onChange }: Props) {
  const reduce = useReducedMotion();

  const count = (id: WomensCategory) =>
    COLOR_COLLECTIONS.filter((c) => c.category === id).length;

  return (
    <section
      className="section-pad relative z-10 mx-auto max-w-[1680px] pb-6 pt-8 md:pb-10 md:pt-4"
      aria-label="Womenswear categories"
    >
      <div className="mb-5 flex flex-col items-center gap-3 text-center md:mb-8 md:flex-row md:items-end md:justify-between md:text-left">
        <div>
          <p className="font-sans text-[0.6rem] uppercase tracking-[0.32em] text-ink/65">
            Shop by form
          </p>
          <h2 className="display mt-1.5 text-[clamp(1.35rem,2.8vw,2rem)] uppercase tracking-[0.18em] text-ink md:mt-2">
            The Edit
          </h2>
        </div>
        <button
          type="button"
          onClick={() => onChange("all")}
          aria-pressed={active === "all"}
          className={`cursor-pointer rounded-full border px-3 py-1.5 font-sans text-[0.55rem] uppercase tracking-[0.28em] transition-colors duration-200 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-ink ${
            active === "all"
              ? "border-ink bg-ink text-cream"
              : "border-ink/25 text-ink/70 hover:border-ink/55 hover:text-ink"
          }`}
        >
          All
        </button>
      </div>

      <ul className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-5">
        {WOMENS_CATEGORIES.map((cat, i) => {
          const on = active === cat.id;
          const n = count(cat.id);
          return (
            <li key={cat.id}>
              <motion.button
                type="button"
                onClick={() => onChange(on ? "all" : cat.id)}
                aria-pressed={on}
                initial={reduce ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.7,
                  delay: reduce ? 0 : i * 0.1,
                  ease: EASE,
                }}
                className={`group relative block aspect-[2/3] w-full cursor-pointer overflow-hidden text-left focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-ink sm:aspect-[3/4] ${
                  on ? "ring-1 ring-ink" : ""
                }`}
              >
                <Image
                  src={cat.image}
                  alt=""
                  fill
                  quality={90}
                  sizes="33vw"
                  className={`object-cover transition-transform duration-[900ms] ease-out motion-reduce:transition-none ${
                    on
                      ? "scale-[1.04]"
                      : "scale-100 group-hover:scale-[1.05]"
                  }`}
                />
                <span
                  className={`absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/35 to-ink/10 transition-opacity duration-300 ${
                    on ? "opacity-100" : "opacity-95 group-hover:opacity-100"
                  }`}
                />
                <span className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-0.5 p-2.5 text-cream sm:gap-1.5 sm:p-5 md:gap-2 md:p-6">
                  <span className="font-sans text-[0.45rem] uppercase tracking-[0.22em] text-cream/75 sm:text-[0.58rem] sm:tracking-[0.3em]">
                    {n > 0 ? `${n} look${n === 1 ? "" : "s"}` : "Soon"}
                  </span>
                  <span className="display text-[clamp(0.85rem,3.6vw,2.35rem)] uppercase leading-tight tracking-[0.1em] sm:tracking-[0.14em]">
                    {cat.title}
                  </span>
                  <span className="hidden max-w-[16rem] text-[0.9rem] leading-snug text-cream/85 sm:block md:text-[0.92rem]">
                    {cat.line}
                  </span>
                  <span className="mt-1 hidden items-center gap-2 font-sans text-[0.58rem] uppercase tracking-[0.28em] text-cream/90 sm:mt-2 sm:inline-flex md:opacity-0 md:transition-all md:duration-300 md:group-hover:opacity-100">
                    {on ? "Selected" : "Explore"}
                    <span
                      className="inline-block h-px w-6 bg-current"
                      aria-hidden
                    />
                  </span>
                </span>
              </motion.button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
