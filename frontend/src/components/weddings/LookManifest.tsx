"use client";

import type { WeddingsContent } from "@/lib/content/pages";
import { EASE_FLUENT, useReducedMotionSafe } from "@/lib/motion";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useMemo, useState } from "react";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

type Frame = { src: string; alt: string };

export default function LookManifest({ content }: { content: WeddingsContent["collections"] }) {
  const reduce = useReducedMotionSafe();
  const collections = useMemo(
    () =>
      (content.items ?? [])
        .map((item, i) => {
          const images = (item.images ?? []).filter(Boolean);
          if (!images.length || !item.title?.trim()) return null;
          const id = item.id?.trim() || slugify(item.title) || `look-${i + 1}`;
          return {
            id,
            kicker: item.kicker?.trim() || "",
            title: item.title.trim(),
            frames: images.map((src, fi) => ({
              src,
              alt: fi === 0 ? item.title : "",
            })) as Frame[],
          };
        })
        .filter((c): c is NonNullable<typeof c> => Boolean(c)),
    [content.items],
  );

  const [ci, setCi] = useState(0);
  const [frame, setFrame] = useState(0);

  if (!collections.length) return null;

  const safeCi = Math.min(ci, collections.length - 1);
  const collection = collections[safeCi]!;
  const frames = collection.frames;
  const safeFrame = Math.min(frame, frames.length - 1);
  const current = frames[safeFrame]!;

  const pickCollection = (i: number) => {
    setCi(i);
    setFrame(0);
  };

  return (
    <section
      className="relative z-10 bg-parchment-light py-10 md:py-14"
      aria-label="Bridal collections"
    >
      <div className="section-pad mx-auto max-w-[1680px]">
        <div className="mb-3 flex items-end justify-between gap-4 md:mb-7">
          <div className="min-w-0 flex-1">
            <p className="font-sans text-[0.58rem] uppercase tracking-[0.32em] text-ink/45">
              {content.eyebrow}
            </p>
            <div
              role="tablist"
              aria-label="Collections"
              className="mt-2 flex snap-x gap-x-5 overflow-x-auto whitespace-nowrap [scrollbar-width:none] md:flex-wrap md:gap-x-6 md:gap-y-1 md:overflow-visible [&::-webkit-scrollbar]:hidden"
            >
              {collections.map((c, i) => (
                <button
                  key={c.id}
                  role="tab"
                  type="button"
                  aria-selected={i === safeCi}
                  onClick={(e) => {
                    pickCollection(i);
                    e.currentTarget.scrollIntoView({
                      behavior: reduce ? "auto" : "smooth",
                      block: "nearest",
                      inline: "center",
                    });
                  }}
                  className={`display relative shrink-0 snap-start pb-1 text-[1.15rem] uppercase leading-[0.95] tracking-[0.1em] transition-colors md:text-[clamp(1.5rem,3.4vw,3rem)] ${
                    i === safeCi ? "text-ink" : "text-ink/30 hover:text-ink/60"
                  }`}
                >
                  {c.title}
                  {i === safeCi && (
                    <motion.span
                      layoutId="collection-underline"
                      className="absolute inset-x-0 -bottom-0.5 h-px bg-ink"
                      transition={{ duration: 0.5, ease: EASE_FLUENT }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
          <span className="hidden shrink-0 font-sans text-[0.62rem] tabular-nums uppercase tracking-[0.28em] text-ink/55 md:inline">
            Look 0{safeFrame + 1} / 0{frames.length}
          </span>
        </div>

        <div className="relative grid grid-cols-12 gap-2 md:h-[78vh] md:max-h-[860px] md:gap-3">
          <div className="relative col-span-12 aspect-[4/5] overflow-hidden md:col-span-8 md:aspect-auto md:h-full">
            <AnimatePresence initial={false} mode="popLayout">
              <motion.div
                key={current.src}
                className="absolute inset-0"
                initial={reduce ? false : { opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9, ease: EASE_FLUENT }}
              >
                <Image
                  src={current.src}
                  alt={current.alt || collection.title}
                  fill
                  quality={92}
                  sizes="(max-width:768px) 100vw, 66vw"
                  className="object-cover object-[50%_38%]"
                />
              </motion.div>
            </AnimatePresence>

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1c140c]/75 via-transparent to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-5 pr-20 md:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={collection.id}
                  initial={reduce ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.5, ease: EASE_FLUENT }}
                >
                  {collection.kicker ? (
                    <p className="font-sans text-[0.6rem] uppercase tracking-[0.32em] text-cream/70">
                      {collection.kicker}
                    </p>
                  ) : null}
                  <h3 className="display mt-1 text-[clamp(1.6rem,3.2vw,3rem)] uppercase leading-[0.95] tracking-[0.1em] text-cream">
                    {collection.title}
                  </h3>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="absolute bottom-4 right-4 z-10 flex w-12 flex-col gap-1.5 md:static md:col-span-4 md:grid md:h-full md:w-auto md:grid-cols-1 md:grid-rows-3 md:gap-3">
            {frames.map((img, i) => {
              const isActive = i === safeFrame;
              return (
                <motion.button
                  key={`${collection.id}-${img.src}-${i}`}
                  type="button"
                  onClick={() => setFrame(i)}
                  aria-label={`Show look ${i + 1}`}
                  aria-pressed={isActive}
                  className="group relative aspect-[3/4] min-h-0 overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-gold md:aspect-auto"
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: reduce ? 0 : i * 0.07,
                    ease: EASE_FLUENT,
                  }}
                >
                  <Image
                    src={img.src}
                    alt=""
                    fill
                    quality={85}
                    sizes="(max-width:768px) 33vw, 30vw"
                    className={`object-cover object-[50%_30%] transition-[transform,filter] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 ${
                      isActive ? "" : "saturate-[0.6]"
                    }`}
                  />
                  <span
                    className={`absolute inset-0 bg-[#1c140c] transition-opacity duration-500 ${
                      isActive ? "opacity-0" : "opacity-40 group-hover:opacity-15"
                    }`}
                  />
                  <span
                    className={`pointer-events-none absolute inset-0 border transition-colors duration-500 ${
                      isActive ? "border-cream" : "border-transparent"
                    }`}
                  />
                  <span className="absolute left-3 top-3 hidden font-sans text-[0.58rem] tracking-[0.3em] text-cream/85 md:block">
                    0{i + 1}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
