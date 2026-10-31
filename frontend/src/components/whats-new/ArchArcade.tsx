"use client";

import type { WhatsNewContent } from "@/lib/content/pages";
import { useReducedMotionSafe } from "@/lib/motion";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type PointerEvent } from "react";

type EditContent = WhatsNewContent["edit"];
type Piece = EditContent["items"][number];

/** Depth between two arches, in px of 3D space. */
const DEPTH = 1100;
/** Scroll length per piece, in svh. */
const STEP_SVH = 85;
const EASE_OUT = [0.23, 1, 0.32, 1] as const;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** Arches zigzag left and right of centre (vw), so the next one peeks out. */
const SWAY = 17;
const swayOf = (i: number) => (i % 2 === 0 ? -SWAY : SWAY);
/** Where the corridor sways at a fractional position along it. */
function swayAt(v: number) {
  const a = Math.floor(v);
  const t = v - a;
  return swayOf(a) + (swayOf(a + 1) - swayOf(a)) * (t * t * (3 - 2 * t));
}

/**
 * One arch in the corridor. `d` is its distance from the camera in arches:
 * 0 is the arch you face, 1 the next one back, -1 one you have walked past.
 */
function Arch({
  piece,
  i,
  p,
  active,
  reduce,
  blur,
  onHover,
}: {
  piece: Piece;
  i: number;
  p: MotionValue<number>;
  active: boolean;
  reduce: boolean;
  blur: MotionValue<string>;
  onHover: (over: boolean) => void;
}) {
  const transform = useTransform(p, (v) => {
    if (reduce) return "translate3d(-50%, -50%, 0)";
    const d = i - v;
    const dx = swayOf(i) - swayAt(v);
    return `translate3d(calc(-50% + ${dx}vw), -50%, ${-d * DEPTH}px)`;
  });
  // Far arches sink into the haze; an arch fades out as you walk through it.
  const opacity = useTransform(p, (v) => {
    const d = i - v;
    if (reduce) return Math.abs(d) < 0.5 ? 1 : 0;
    if (d < 0) return clamp01(1 + d * 2.4);
    return clamp01(1 - d * 0.28);
  });

  return (
    <motion.div
      style={{ transform, opacity, filter: reduce ? undefined : blur }}
      className="absolute left-1/2 top-[46%] will-change-transform"
      aria-hidden={!active}
    >
      <Link
        href={piece.link || "#"}
        tabIndex={active ? 0 : -1}
        onPointerEnter={() => active && onHover(true)}
        onPointerLeave={() => onHover(false)}
        className={`group block outline-none ${active ? "" : "pointer-events-none"}`}
        aria-label={`View ${piece.name}`}
      >
        {/* Double gold frame */}
        <span className="arcade-arch relative block h-[62svh] max-h-[640px] w-[min(72vw,440px)]">
          <span className="absolute -inset-5 border border-gold/45 md:-inset-7" />
          <span className="absolute -inset-2 border border-gold/25 md:-inset-3" />
          <span className="relative block h-full w-full overflow-hidden bg-[#1a120a]">
            <Image
              src={piece.image}
              alt={piece.name}
              fill
              sizes="(max-width:768px) 72vw, 440px"
              quality={85}
              priority={i < 2}
              className="object-cover object-[50%_25%] transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-[1.03]"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-[#120d08]/55 via-transparent to-transparent" />
          </span>
          {/* Plinth */}
          <span className="absolute -bottom-7 left-1/2 h-px w-[130%] -translate-x-1/2 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
        </span>
      </Link>
    </motion.div>
  );
}

/** The piece name, letter by letter, re-set each time a new arch is reached. */
function SplitName({ name, reduce }: { name: string; reduce: boolean }) {
  return (
    <h3
      aria-label={name}
      className="display flex flex-wrap text-[clamp(1.9rem,4.4vw,4.2rem)] uppercase leading-[0.95] tracking-[0.06em] text-cream"
    >
      {name.split(" ").map((word, w) => (
        <span key={w} aria-hidden className="mr-[0.3em] inline-flex overflow-hidden">
          {word.split("").map((ch, c) => (
            <motion.span
              key={c}
              className="inline-block"
              initial={reduce ? { opacity: 0 } : { transform: "translateY(105%)", filter: "blur(3px)" }}
              animate={reduce ? { opacity: 1 } : { transform: "translateY(0%)", filter: "blur(0px)" }}
              transition={{ duration: reduce ? 0.2 : 0.5, delay: reduce ? 0 : (w * 4 + c) * 0.018, ease: EASE_OUT }}
            >
              {ch}
            </motion.span>
          ))}
        </span>
      ))}
    </h3>
  );
}

/** "View piece" that leans toward a fine pointer, then springs back. */
function MagneticLink({ href, reduce }: { href: string; reduce: boolean }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });
  const transform = useTransform([sx, sy], ([a, b]) => `translate3d(${a}px, ${b}px, 0)`);

  const onMove = (e: PointerEvent<HTMLAnchorElement>) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * 0.3);
    y.set((e.clientY - r.top - r.height / 2) * 0.3);
  };

  return (
    <motion.a
      href={href}
      onPointerMove={onMove}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
      style={{ transform }}
      className="mt-6 inline-flex min-h-12 items-center gap-3 rounded-full border border-gold/60 px-6 transition-colors duration-200 hover:bg-gold active:scale-[0.97]"
    >
      {/* Colour sits on the span: the site's global `a { color: inherit }` overrides utilities on links */}
      <span className="font-sans text-[0.62rem] uppercase tracking-[0.28em] text-cream">View piece</span>
      <span aria-hidden className="text-gold-soft">
        →
      </span>
    </motion.a>
  );
}

/**
 * The Edit as a Mughal arcade: scrolling walks forward through a corridor of
 * gold-framed panels, each holding one new piece. The corridor stays pinned an
 * extra screen so the next section can slide over it.
 */
export default function ArchArcade({ content }: { content: EditContent }) {
  const reduce = Boolean(useReducedMotionSafe());
  const measureRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const pieces = content.items;
  const total = pieces.length;
  const travel = Math.max(total - 1, 0) * STEP_SVH + 100;

  const [active, setActive] = useState(0);
  const [overArch, setOverArch] = useState(false);

  const { scrollYProgress } = useScroll({ target: measureRef, offset: ["start start", "end end"] });
  const raw = useTransform(scrollYProgress, (v) => v * Math.max(total - 1, 0));
  const smooth = useSpring(raw, { stiffness: 110, damping: 26, mass: 0.6 });
  const p = reduce ? raw : smooth;

  // Slight motion blur that follows walking speed: sharp at rest, up to 2.5px in a fast scroll.
  const speed = useVelocity(smooth);
  const blur = useTransform(speed, (v) => `blur(${Math.min(Math.abs(v) * 0.9, 2.5).toFixed(2)}px)`);

  useMotionValueEvent(raw, "change", (v) => setActive(Math.min(total - 1, Math.max(0, Math.round(v)))));

  // Gold cursor ring, mouse only, trailing the pointer with a spring.
  const cx = useMotionValue(-100);
  const cy = useMotionValue(-100);
  const rx = useSpring(cx, { stiffness: 500, damping: 40, mass: 0.3 });
  const ry = useSpring(cy, { stiffness: 500, damping: 40, mass: 0.3 });
  const ringTransform = useTransform([rx, ry], ([a, b]) => `translate3d(${a}px, ${b}px, 0) translate(-50%, -50%)`);
  const [ringOn, setRingOn] = useState(false);

  const piece = pieces[active];
  if (!piece) return null;

  return (
    <section aria-label="Season arrivals" className="relative z-10 bg-[#120d08]" style={{ height: `${travel + 100}svh` }}>
      <div ref={measureRef} aria-hidden className="pointer-events-none absolute left-0 top-0 w-px" style={{ height: `${travel}svh` }} />

      <div
        ref={stageRef}
        className="sticky top-0 h-[100svh] overflow-hidden"
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse" || reduce) return;
          const r = stageRef.current?.getBoundingClientRect();
          if (!r) return;
          cx.set(e.clientX - r.left);
          cy.set(e.clientY - r.top);
          if (!ringOn) setRingOn(true);
        }}
        onPointerLeave={() => setRingOn(false)}
      >
        {/* Lamp-light at the far end of the corridor, and a stone floor */}
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_44%,rgba(197,160,89,0.22),transparent_70%)]" />
        <div aria-hidden className="arcade-floor absolute inset-x-0 bottom-0 h-[42%]" />

        {/* The corridor */}
        <div className="absolute inset-0 [perspective:900px] [perspective-origin:50%_44%]">
          <div className="absolute inset-0 [transform-style:preserve-3d]">
            {pieces.map((pc, i) => (
              <Arch key={`${pc.name}-${i}`} piece={pc} i={i} p={p} active={i === active} reduce={reduce} blur={blur} onHover={setOverArch} />
            ))}
          </div>
        </div>

        {/* Heading */}
        <div className="section-pad pointer-events-none absolute inset-x-0 top-0 pt-8 md:pt-10">
          <p className="font-sans text-[0.62rem] uppercase tracking-[0.32em] text-gold-soft">{content.eyebrow}</p>
          <h2 className="display mt-2 text-[clamp(1.8rem,4vw,3.4rem)] uppercase leading-[0.95] tracking-[0.12em] text-cream">
            {content.title}
          </h2>
        </div>

        {/* The piece you are facing */}
        <div className="section-pad absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 pb-8 md:pb-12">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active}
              className="min-w-0 max-w-[min(90vw,46rem)]"
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
            >
              <p className="font-sans text-[0.6rem] uppercase tracking-[0.3em] text-gold-soft">{piece.craft}</p>
              <div className="mt-2">
                <SplitName name={piece.name} reduce={reduce} />
              </div>
              <MagneticLink href={piece.link || "#"} reduce={reduce} />
            </motion.div>
          </AnimatePresence>

          <p
            aria-hidden
            className="display hidden shrink-0 text-[clamp(4rem,9vw,8rem)] leading-[0.8] text-transparent [-webkit-text-stroke:1px_rgba(197,160,89,0.55)] md:block"
          >
            {String(active + 1).padStart(2, "0")}
          </p>
        </div>

        {/* Cursor ring: a fixed-size ring scaled up over the arch you face (transform only) */}
        {!reduce && (
          <motion.div
            aria-hidden
            style={{ transform: ringTransform }}
            className={`pointer-events-none absolute left-0 top-0 z-30 hidden transition-opacity duration-200 [@media(hover:hover)_and_(pointer:fine)]:block ${
              ringOn ? "opacity-100" : "opacity-0"
            }`}
          >
            <span
              className={`grid h-20 w-20 place-items-center rounded-full border border-gold/80 transition-[transform,background-color] duration-200 ease-[var(--ease-out)] ${
                overArch ? "scale-100 bg-gold/90" : "scale-[0.4] bg-transparent"
              }`}
            >
              <span
                className={`font-sans text-[0.55rem] uppercase tracking-[0.28em] text-[#120d08] transition-opacity duration-150 ${
                  overArch ? "opacity-100" : "opacity-0"
                }`}
              >
                View
              </span>
            </span>
          </motion.div>
        )}
      </div>
    </section>
  );
}
