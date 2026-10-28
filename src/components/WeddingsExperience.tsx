"use client";

import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useRef, type ReactNode } from "react";
import {
  BRIDAL_COLLECTIONS,
  WEDDING_MOMENTS,
  type RailImage,
  type WeddingMoment,
} from "@/lib/bridal-collections";

const EASE = [0.22, 1, 0.36, 1] as const;
const MOMENT_COUNT = WEDDING_MOMENTS.length;

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.85, delay: reduce ? 0 : delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

function MomentLayer({
  moment,
  index,
  progress,
  reduce,
}: {
  moment: WeddingMoment;
  index: number;
  progress: MotionValue<number>;
  reduce: boolean | null;
}) {
  const start = index / MOMENT_COUNT;
  const mid = (index + 0.45) / MOMENT_COUNT;
  const end = (index + 1) / MOMENT_COUNT;

  const opacity = useTransform(
    progress,
    [start, mid, end],
    index === 0
      ? [1, 1, 0]
      : index === MOMENT_COUNT - 1
        ? [0, 1, 1]
        : [0, 1, 0],
  );
  const clip = useTransform(
    progress,
    [start, mid],
    reduce
      ? ["inset(0% 0% 0% 0%)", "inset(0% 0% 0% 0%)"]
      : ["inset(18% 12% 18% 12%)", "inset(0% 0% 0% 0%)"],
  );
  const scale = useTransform(
    progress,
    [start, end],
    reduce ? [1, 1] : [1.12, 1],
  );
  const titleY = useTransform(
    progress,
    [start, mid, end],
    reduce ? [0, 0, 0] : [24, 0, -16],
  );

  return (
    <motion.div
      className="absolute inset-0"
      style={{ opacity, clipPath: clip }}
    >
      <motion.div className="absolute inset-0" style={{ scale }}>
        <Image
          src={moment.image}
          alt=""
          fill
          priority={index === 0}
          quality={90}
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/10 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 z-[2] section-pad pb-12 pt-24 md:pb-16">
        <motion.div style={{ y: titleY }} className="mx-auto max-w-[1680px]">
          <p className="font-sans text-[0.6rem] uppercase tracking-[0.36em] text-cream/70">
            Moment {moment.index}
          </p>
          <h2 className="display mt-3 text-[clamp(2.1rem,6vw,4.5rem)] uppercase leading-[0.95] tracking-[0.12em] text-cream">
            {moment.title}
          </h2>
          <p className="mt-4 max-w-md text-[1.02rem] leading-relaxed text-cream/85 md:text-[1.08rem]">
            {moment.line}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

function MomentStage({
  progress,
  reduce,
}: {
  progress: MotionValue<number>;
  reduce: boolean | null;
}) {
  const watermarkX = useTransform(
    progress,
    [0, 1],
    reduce ? [0, 0] : ["-4%", "4%"],
  );

  return (
    <div className="relative h-full w-full overflow-hidden bg-parchment-light">
      {WEDDING_MOMENTS.map((moment, i) => (
        <MomentLayer
          key={moment.id}
          moment={moment}
          index={i}
          progress={progress}
          reduce={reduce}
        />
      ))}

      <motion.p
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[12%] z-[1] -translate-x-1/2 select-none display text-[clamp(4.5rem,18vw,14rem)] uppercase leading-none tracking-[0.08em] text-cream/[0.08]"
        style={{ x: watermarkX }}
      >
        Bridal
      </motion.p>
    </div>
  );
}

function WeddingTheatre() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const smooth = useSpring(scrollYProgress, {
    stiffness: reduce ? 400 : 90,
    damping: reduce ? 40 : 28,
    mass: 0.35,
  });

  return (
    <section
      ref={ref}
      className="relative z-10 h-[320vh] md:h-[380vh]"
      aria-label="Bridal moments"
    >
      <div className="sticky top-0 h-[100dvh] w-full">
        <MomentStage progress={smooth} reduce={reduce} />
      </div>
    </section>
  );
}

function DriftRail({
  images,
  reverse = false,
}: {
  images: RailImage[];
  reverse?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const x = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? ["0%", "0%"] : reverse ? ["-12%", "8%"] : ["8%", "-14%"],
  );

  return (
    <div ref={ref} className="overflow-hidden py-2">
      <motion.div
        style={{ x }}
        className="flex w-max gap-3 px-3 md:gap-5 md:px-5"
      >
        {[...images, ...images].map((img, i) => (
          <div
            key={`${img.src}-${i}`}
            className="relative aspect-[2/3] h-[42vh] shrink-0 overflow-hidden md:h-[58vh]"
          >
            <Image
              src={img.src}
              alt=""
              fill
              quality={88}
              sizes="40vw"
              className="object-cover"
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function CollectionChapter({
  title,
  kicker,
  story,
  href,
  images,
  index,
}: {
  title: string;
  kicker: string;
  story: string;
  href?: string;
  images: RailImage[];
  index: number;
}) {
  const mirrored = index % 2 === 1;
  const hero = images[0];
  const side = images.slice(1, 3);

  return (
    <section className="relative z-10 overflow-hidden py-10 md:py-16">
      <div className="section-pad mx-auto max-w-[1680px]">
        <div className="grid items-start gap-8 md:grid-cols-12 md:gap-10">
          <Reveal
            className={`md:col-span-5 md:sticky md:top-24 ${mirrored ? "md:order-2" : ""}`}
          >
            <p className="font-sans text-[0.6rem] uppercase tracking-[0.32em] text-ink/55">
              {kicker}
            </p>
            <h2 className="display mt-3 text-[clamp(2rem,5vw,3.75rem)] uppercase leading-[0.95] tracking-[0.12em] text-ink">
              {title}
            </h2>
            <p className="mt-5 max-w-md text-[1.05rem] leading-relaxed text-ink-soft">
              {story}
            </p>
            {href ? (
              <Link href={href} className="ww-explore mt-8 inline-flex">
                <span>Explore the look</span>
                <span className="ww-explore__arrow" aria-hidden />
              </Link>
            ) : null}
          </Reveal>

          <Reveal
            delay={0.1}
            className={`md:col-span-7 ${mirrored ? "md:order-1" : ""}`}
          >
            <div className="grid grid-cols-12 gap-3 md:gap-4">
              <div className="relative col-span-7 aspect-[2/3] overflow-hidden bg-parchment-deep/30 md:col-span-8">
                <Image
                  src={hero.src}
                  alt={`${title}, lead look`}
                  fill
                  quality={92}
                  sizes="(max-width:768px) 60vw, 42vw"
                  className="object-cover"
                />
              </div>
              <div className="col-span-5 flex flex-col gap-3 md:col-span-4 md:gap-4">
                {side.map((img, i) => (
                  <div
                    key={img.src}
                    className={`relative flex-1 overflow-hidden bg-parchment-deep/30 ${
                      i === 0 ? "aspect-[3/4]" : "aspect-[2/3]"
                    }`}
                  >
                    <Image
                      src={img.src}
                      alt=""
                      fill
                      quality={88}
                      sizes="25vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      <div className="mt-12 md:mt-16">
        <DriftRail images={images} reverse={mirrored} />
      </div>
    </section>
  );
}

export default function WeddingsExperience() {
  return (
    <>
      <WeddingTheatre />

      {BRIDAL_COLLECTIONS.map((col, i) => (
        <CollectionChapter
          key={col.title}
          title={col.title}
          kicker={col.kicker}
          story={col.story}
          href={col.href}
          images={col.images}
          index={i}
        />
      ))}
    </>
  );
}
