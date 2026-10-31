"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  MENS_COLLECTIONS,
  type MensCollection,
  type RailImage,
  type MensCategory,
} from "@/lib/mens-collections";

const EASE = [0.22, 1, 0.36, 1] as const;
const STAGGER = 0.18;

type OpenFn = (chapter: number, image: number) => void;

const chapterId = (i: number) => `chapter-${String(i + 1).padStart(2, "0")}`;

const cardHidden = { opacity: 0, y: 40 };
const cardShow = { opacity: 1, y: 0 };

const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: STAGGER,
      delayChildren: 0.06,
    },
  },
};

const staggerItem = {
  hidden: cardHidden,
  show: {
    ...cardShow,
    transition: { duration: 0.75, ease: EASE },
  },
};

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
      initial={reduce ? false : cardHidden}
      whileInView={cardShow}
      viewport={{ once: true, amount: 0.2, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.75, delay: reduce ? 0 : delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Cards in a row enter one-by-one when the row scrolls into view. */
function StaggerRow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25, margin: "0px 0px -6% 0px" }}
    >
      {children}
    </motion.div>
  );
}

function StaggerCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div className={className} variants={staggerItem}>
      {children}
    </motion.div>
  );
}

function PlusIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      aria-hidden
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function ExploreLookButton({
  href,
  tone = "dark",
}: {
  href: string;
  tone?: "dark" | "light";
}) {
  return (
    <Link
      href={href}
      className={`ww-explore ${tone === "light" ? "ww-explore--light" : ""}`}
    >
      <span>Explore the look</span>
      <span className="ww-explore__arrow" aria-hidden />
    </Link>
  );
}

function ChevronIcon({
  dir,
  className = "",
}: {
  dir: "left" | "right";
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      aria-hidden
    >
      <path d={dir === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
    </svg>
  );
}

function Plate({
  img,
  alt,
  sizes,
  onOpen,
  parallax = false,
}: {
  img: RailImage;
  alt: string;
  sizes: string;
  onOpen: () => void;
  parallax?: boolean;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);
  const moving = parallax && !reduce;

  return (
    <button
      ref={ref}
      type="button"
      onClick={onOpen}
      aria-label={`View ${alt}`}
      className="group relative block aspect-[2/3] w-full cursor-zoom-in overflow-hidden bg-parchment-deep/40 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-ink"
    >
      <motion.span
        className={`absolute inset-0 block ${moving ? "scale-[1.1]" : ""}`}
        style={moving ? { y } : undefined}
      >
        <Image
          src={img.src}
          alt={alt}
          fill
          quality={90}
          sizes={sizes}
          className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      </motion.span>
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/45 via-ink/0 to-ink/0 opacity-40 transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100 md:group-focus-visible:opacity-100" />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between px-4 pb-4 text-cream opacity-90 transition-[opacity,transform] duration-200 ease-[var(--ease-out)] md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-visible:opacity-100">
        <span className="font-sans text-[0.6rem] uppercase tracking-[0.3em]">
          View
        </span>
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-cream/70">
          <PlusIcon className="h-4 w-4" />
        </span>
      </span>
    </button>
  );
}

function ChapterStory({ col }: { col: MensCollection }) {
  return (
    <>
      <span className="mx-auto hairline bg-[#d4b36e] opacity-90" />
      {col.story ? (
        <p className="display mx-auto mt-4 max-w-md text-[0.98rem] italic leading-relaxed text-ink-soft md:mt-5 md:text-[clamp(0.88rem,1.25vw,1.05rem)] lg:max-w-[22rem]">
          {col.story}
        </p>
      ) : (
        <>
          <ul className="mt-4 space-y-2 md:mt-5">
            {col.notes?.map((note) => (
              <li
                key={note}
                className="display text-[1rem] italic text-ink-soft md:text-[clamp(0.95rem,1.5vw,1.2rem)]"
              >
                {note}
              </li>
            ))}
          </ul>
          <p className="mt-4 font-sans text-[0.58rem] uppercase tracking-[0.3em] text-ink/50 md:mt-5">
            Finished by the atelier, Ahmedabad
          </p>
        </>
      )}
    </>
  );
}

function Chapter({
  col,
  index,
  onOpen,
}: {
  col: MensCollection;
  index: number;
  onOpen: OpenFn;
}) {
  const mirrored = index % 2 === 1;
  const alt = (n: number) => `${col.title}, look ${n + 1}`;
  const open = (n: number) => () => onOpen(index, n);

  return (
    <section
      id={chapterId(index)}
      aria-labelledby={`${chapterId(index)}-title`}
      className="relative z-10 scroll-mt-20 py-10 md:mx-auto md:max-w-[1680px] md:scroll-mt-6 md:py-24"
    >
      {/* ——— Mobile layout ——— */}
      <div className="md:hidden">
        <Reveal className="section-pad">
          <p className="font-sans text-[0.55rem] uppercase tracking-[0.3em] text-ink/55">
            {col.label}
          </p>
          <h2
            id={`${chapterId(index)}-title`}
            className="display mt-2 text-[clamp(1.7rem,8vw,2.4rem)] uppercase leading-[1.05] tracking-[0.12em] text-ink"
          >
            {col.title}
          </h2>
          {col.description ? (
            <p className="mt-3 text-[0.98rem] leading-relaxed text-ink-soft">
              {col.description}
            </p>
          ) : null}
          <div className="mt-5">
            {col.href ? (
              <ExploreLookButton href={col.href} />
            ) : (
              <p className="font-sans text-[0.62rem] uppercase tracking-[0.3em] text-ink/55">
                By appointment
              </p>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.08} className="mt-6">
          <Plate
            img={col.images[0]}
            alt={alt(0)}
            onOpen={open(0)}
            sizes="100vw"
          />
        </Reveal>

        <Reveal
          delay={0.12}
          className="section-pad mx-auto max-w-lg py-8 text-center"
        >
          <ChapterStory col={col} />
        </Reveal>

        <div className="rail-hide-scroll section-pad gap-2.5 pb-1">
          {[1, 2, 3, 4].map((imageIndex, i) => (
            <Reveal
              key={col.images[imageIndex].src}
              delay={0.06 + i * 0.05}
              className="w-[58vw] max-w-[240px] shrink-0"
            >
              <Plate
                img={col.images[imageIndex]}
                alt={alt(imageIndex)}
                onOpen={open(imageIndex)}
                sizes="58vw"
              />
            </Reveal>
          ))}
        </div>
      </div>

      {/* ——— Desktop layout ——— */}
      <div className="section-pad hidden md:block">
        <div className="grid grid-cols-12 gap-8 lg:gap-14">
          <Reveal
            delay={0}
            className={`col-span-5 ${mirrored ? "order-2" : ""}`}
          >
            <Plate
              img={col.images[0]}
              alt={alt(0)}
              onOpen={open(0)}
              parallax
              sizes="42vw"
            />
          </Reveal>

          <div
            className={`flex flex-col col-span-7 ${mirrored ? "order-1" : ""}`}
          >
            <Reveal delay={STAGGER}>
              <h2 className="display text-[clamp(1.9rem,4.4vw,3.8rem)] uppercase leading-[1.05] tracking-[0.14em] text-ink">
                {col.title}
              </h2>

              {col.description ? (
                <p className="mt-5 max-w-lg text-[1.05rem] leading-relaxed text-ink-soft">
                  {col.description}
                </p>
              ) : null}

              <div className="mt-7">
                {col.href ? (
                  <ExploreLookButton href={col.href} />
                ) : (
                  <p className="font-sans text-[0.62rem] uppercase tracking-[0.3em] text-ink/55">
                    By appointment
                  </p>
                )}
              </div>
            </Reveal>

            <StaggerRow className="mt-10 grid grid-cols-2 items-start gap-5 pt-10 lg:gap-6">
              <StaggerCard>
                <Plate
                  img={col.images[1]}
                  alt={alt(1)}
                  onOpen={open(1)}
                  sizes="28vw"
                />
              </StaggerCard>
              <StaggerCard>
                <Plate
                  img={col.images[2]}
                  alt={alt(2)}
                  onOpen={open(2)}
                  sizes="28vw"
                />
              </StaggerCard>
            </StaggerRow>
          </div>
        </div>

        <StaggerRow className="mt-12 grid grid-cols-3 items-center gap-5 lg:gap-6">
          <StaggerCard>
            <Plate
              img={col.images[3]}
              alt={alt(3)}
              onOpen={open(3)}
              sizes="28vw"
            />
          </StaggerCard>

          <StaggerCard className="flex flex-col items-center justify-center px-3 text-center lg:px-5">
            <ChapterStory col={col} />
          </StaggerCard>

          <StaggerCard>
            <Plate
              img={col.images[4]}
              alt={alt(4)}
              onOpen={open(4)}
              sizes="28vw"
            />
          </StaggerCard>
        </StaggerRow>
      </div>
    </section>
  );
}

function Lightbox({
  col,
  image,
  onClose,
  onChange,
}: {
  col: MensCollection;
  image: number;
  onClose: () => void;
  onChange: (image: number) => void;
}) {
  const total = col.images.length;
  const reduce = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [dir, setDir] = useState(0);

  const go = useCallback(
    (step: number) => {
      setDir(step);
      onChange((image + step + total) % total);
    },
    [image, total, onChange],
  );

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      previous?.focus();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  const img = col.images[image];
  const offset = reduce ? 0 : 60;

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex flex-col bg-[#14100b]/95 text-cream"
      role="dialog"
      aria-modal="true"
      aria-label={`${col.title} gallery`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
    >
      <div className="section-pad flex items-center justify-between py-5">
        <div className="flex items-center gap-3">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: col.accent }}
            aria-hidden
          />
          <p className="display text-sm uppercase tracking-[0.24em] md:text-base">
            {col.title}
          </p>
          <p
            className="font-sans text-[0.62rem] tracking-[0.2em] text-cream/60"
            aria-live="polite"
          >
            {image + 1} / {total}
          </p>
        </div>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="flex cursor-pointer items-center gap-2 font-sans text-[0.6rem] uppercase tracking-[0.3em] text-cream/80 transition-colors duration-200 hover:text-cream focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-cream"
        >
          Close
          <PlusIcon className="h-5 w-5 rotate-45" />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-14 md:px-24">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous look"
          className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-cream/30 text-cream/80 transition-colors duration-200 hover:border-cream hover:text-cream focus-visible:outline focus-visible:outline-1 focus-visible:outline-cream md:left-8"
        >
          <ChevronIcon dir="left" className="h-5 w-5" />
        </button>

        <AnimatePresence initial={false} mode="popLayout" custom={dir}>
          <motion.div
            key={img.src}
            className="relative aspect-[2/3] h-full max-h-[calc(100dvh-13rem)] cursor-grab active:cursor-grabbing"
            custom={dir}
            initial={{ opacity: 0, x: dir * offset }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -dir * offset }}
            transition={{ duration: 0.45, ease: EASE }}
            drag={reduce ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.25}
            onDragEnd={(_, info) => {
              if (info.offset.x < -70) go(1);
              else if (info.offset.x > 70) go(-1);
            }}
          >
            <Image
              src={img.src}
              alt={`${col.title}, look ${image + 1}`}
              fill
              quality={95}
              priority
              sizes="(max-width:768px) 80vw, 46vh"
              className="pointer-events-none select-none object-contain"
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>

        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next look"
          className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-cream/30 text-cream/80 transition-colors duration-200 hover:border-cream hover:text-cream focus-visible:outline focus-visible:outline-1 focus-visible:outline-cream md:right-8"
        >
          <ChevronIcon dir="right" className="h-5 w-5" />
        </button>
      </div>

      <div className="section-pad flex flex-col items-center gap-4 py-5 md:flex-row md:justify-between">
        <ul className="flex gap-2" aria-label="Looks">
          {col.images.map((thumb, i) => (
            <li key={thumb.src}>
              <button
                type="button"
                onClick={() => {
                  setDir(i > image ? 1 : -1);
                  onChange(i);
                }}
                aria-label={`Look ${i + 1}`}
                aria-current={i === image ? "true" : undefined}
                className={`relative block h-14 w-10 cursor-pointer overflow-hidden transition-opacity duration-200 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-cream md:h-16 md:w-11 ${
                  i === image
                    ? "opacity-100 ring-1 ring-cream"
                    : "opacity-45 hover:opacity-80"
                }`}
              >
                <Image
                  src={thumb.src}
                  alt=""
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
        {col.href ? (
          <ExploreLookButton href={col.href} tone="light" />
        ) : (
          <p className="font-sans text-[0.6rem] uppercase tracking-[0.3em] text-cream/60">
            By appointment
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default function MenswearChapters({
  category = "all",
}: {
  category?: MensCategory | "all";
}) {
  const items =
    category === "all"
      ? MENS_COLLECTIONS
      : MENS_COLLECTIONS.filter((c) => c.category === category);

  const [lightbox, setLightbox] = useState<{
    chapter: number;
    image: number;
  } | null>(null);

  const open: OpenFn = useCallback(
    (chapter, image) => setLightbox({ chapter, image }),
    [],
  );

  if (!items.length) {
    return (
      <div className="section-pad mx-auto max-w-xl py-20 text-center md:py-28">
        <p className="display text-[clamp(1.4rem,3vw,2rem)] uppercase tracking-[0.2em] text-ink">
          Coming soon
        </p>
        <p className="mt-4 text-[1.02rem] leading-relaxed text-ink-soft">
          Looks from the atelier will appear here. Write to the house for a
          private viewing in the meantime.
        </p>
      </div>
    );
  }

  return (
    <>
      <div id="menswear-looks">
        {items.map((col, i) => (
          <div key={col.title}>
            {i > 0 ? (
              <div className="section-pad mx-auto flex max-w-[1680px] items-center gap-4 text-gold">
                <span className="h-px flex-1 bg-current opacity-70" />
                <span className="h-1.5 w-1.5 rotate-45 bg-current opacity-90" />
                <span className="h-px flex-1 bg-current opacity-70" />
              </div>
            ) : null}
            <Chapter col={col} index={i} onOpen={open} />
          </div>
        ))}
      </div>

      <AnimatePresence>
        {lightbox ? (
          <Lightbox
            key="lightbox"
            col={items[lightbox.chapter]}
            image={lightbox.image}
            onClose={() => setLightbox(null)}
            onChange={(image) =>
              setLightbox((lb) => (lb ? { ...lb, image } : lb))
            }
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}
