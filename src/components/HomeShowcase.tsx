"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { HOUSE_COPY, HOME_SHOWCASE } from "@/lib/data";
import AutoLoopVideo from "./AutoLoopVideo";
import MediaFrame, { toneForSlug } from "./MediaFrame";

function FullBleedCraft({
  eyebrow,
  title,
  href,
  image,
  slug,
  dim = true,
  video,
  videoPoster,
}: {
  eyebrow: string;
  title: string;
  href: string;
  image: string;
  slug: string;
  dim?: boolean;
  video?: string;
  videoPoster?: string;
}) {
  const isVideo = Boolean(video);

  return (
    <section
      className={
        isVideo
          ? "relative aspect-video w-full overflow-hidden md:min-h-[56dvh]"
          : "full-bleed"
      }
    >
      {isVideo ? (
        <AutoLoopVideo
          className="absolute inset-0 h-full w-full object-cover"
          src={video!}
          poster={videoPoster}
          aria-label={title}
        />
      ) : (
        <MediaFrame
          src={image || ""}
          alt={title}
          tone={toneForSlug(slug)}
          label={title}
          quality={100}
          sizes="100vw"
        />
      )}
      {dim && !isVideo ? (
        <div className="absolute inset-0 z-[1] bg-black/35" />
      ) : null}
      <div className="absolute inset-0 z-[2] flex items-end justify-center pb-[10%] text-white md:pb-[12%]">
        <div className="flex flex-col items-center text-center drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]">
          <p className="font-sans text-[0.6rem] uppercase tracking-[0.35em] text-white/90">
            {eyebrow}
          </p>
          <h2 className="display mt-3 text-[clamp(1.75rem,4.5vw,3rem)] uppercase tracking-[0.18em]">
            {title}
          </h2>
          <Link
            href={href}
            className="ghost-btn mt-8 px-14 py-4.5 text-[0.95rem] tracking-[0.34em] md:px-16 md:py-5 md:text-[1.05rem]"
          >
            Explore
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function HomeShowcase() {
  const houseRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: houseRef,
    offset: ["start end", "end start"],
  });
  const opacity = useTransform(scrollYProgress, [0.15, 0.4], [0, 1]);
  const y = useTransform(scrollYProgress, [0.15, 0.4], [36, 0]);

  return (
    <>
      {HOME_SHOWCASE.slice(1).map((item) => (
        <FullBleedCraft
          key={item.href}
          eyebrow={item.eyebrow}
          title={item.title}
          href={item.href}
          image={item.image}
          slug={item.href.split("/").pop() ?? "dark"}
          dim={item.dim}
          video={"video" in item ? item.video : undefined}
          videoPoster={"videoPoster" in item ? item.videoPoster : undefined}
        />
      ))}

      <section
        ref={houseRef}
        className="relative parchment-surface parchment-noise section-pad py-24 md:py-32"
      >
        <motion.div
          style={{ opacity, y }}
          className="relative z-10 mx-auto max-w-3xl text-center"
        >
          <div className="mb-8 flex items-center justify-center gap-4">
            <span className="hairline bg-gold" />
            <h2 className="display text-[clamp(1.35rem,2.8vw,2rem)] uppercase tracking-[0.28em] text-gold-soft">
              The House
            </h2>
            <span className="hairline bg-gold" />
          </div>
          <p className="display text-[clamp(0.95rem,1.8vw,1.2rem)] leading-[1.6] text-ink">
            {HOUSE_COPY}
          </p>
          <Link
            href="/atelier"
            className="ghost-btn ghost-btn-dark mt-10 inline-flex items-center gap-2.5 text-ink"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 shrink-0"
              fill="currentColor"
              aria-hidden
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Contact Us
          </Link>
        </motion.div>
      </section>
    </>
  );
}
