"use client";

import Link from "next/link";
import { HOUSE_COPY, HOME_SHOWCASE } from "@/lib/data";
import AutoLoopVideo from "./AutoLoopVideo";
import { BentoHeading, BentoPanel, BentoPhoto } from "./bento/BentoTile";
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

      {/* The House, as a bento of the house's stories around its statement */}
      <section className="relative parchment-surface parchment-noise section-pad py-20 md:py-28" aria-label="The House">
        <div className="relative z-10 mx-auto max-w-[1280px]">
          <BentoHeading eyebrow="Kesari" title="The House" />

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:grid-rows-[repeat(3,minmax(200px,auto))] md:gap-4">
            <BentoPanel shape="arch" className="col-span-2 row-span-2 px-7 pb-10 pt-24 text-center md:px-14 md:pt-32">
              <span className="khatam mx-auto text-gold" aria-hidden />
              <p className="display mt-6 text-[clamp(1rem,1.7vw,1.22rem)] leading-[1.75] text-ink">{HOUSE_COPY}</p>
              <div className="mt-auto flex justify-center pt-8">
                <Link href="/atelier" className="ghost-btn ghost-btn-dark inline-flex items-center gap-2.5 text-ink">
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
              </div>
            </BentoPanel>

            <BentoPhoto
              href="/crafts/soft-bridal"
              image="/images/hero-wedding.jpg"
              eyebrow="Wedding"
              title="Soft Bridal"
              shape="arch"
              className="col-span-2 min-h-[420px] md:col-span-1 md:row-span-2"
              sizes="(max-width:768px) 100vw, 25vw"
            />
            <BentoPhoto
              href="/crafts/warm-saffron"
              image="/images/hero-orange.jpg"
              eyebrow="Orange"
              title="Warm Saffron"
              sizes="(max-width:768px) 50vw, 25vw"
            />
            <BentoPhoto
              href="/crafts/deep-plum"
              image="/images/VIOLET/DSC06518.jpg"
              eyebrow="Violet"
              title="Midnight Bloom"
              sizes="(max-width:768px) 50vw, 25vw"
            />

            <Link href="/whats-new" className="bento-tile mughal-frame group relative col-span-2 block min-h-[200px] overflow-hidden bg-[#1a140e] p-7 pr-20 md:p-9 md:pr-24">
              <span className="relative z-10 flex h-full flex-col justify-between gap-6">
                <span className="khatam text-gold" aria-hidden />
                <span>
                  <span className="block font-sans text-[0.58rem] uppercase tracking-[0.32em] text-gold-soft">The Season</span>
                  <span className="display mt-2 block text-[clamp(1.4rem,2.6vw,2.2rem)] uppercase leading-tight tracking-[0.1em] text-cream">
                    What&apos;s New
                  </span>
                  <span className="mt-2 block max-w-sm text-[0.95rem] leading-relaxed text-cream/65">
                    The newest pieces from the working table, in the order they were finished.
                  </span>
                </span>
              </span>
              <span aria-hidden className="absolute bottom-7 right-7 z-10 grid h-11 w-11 place-items-center rounded-full border border-cream/40 text-cream transition-colors duration-200 group-hover:border-gold group-hover:bg-gold group-hover:text-[#1a140e] md:bottom-9 md:right-9">
                →
              </span>
            </Link>

            <Link href="/crafts" className="bento-tile mughal-frame group relative col-span-2 block min-h-[200px] overflow-hidden parchment-surface p-7 md:p-9">
              <span className="relative z-10 flex h-full flex-col justify-between gap-5">
                <span className="block font-sans text-[0.58rem] uppercase tracking-[0.32em] text-ink/60">The Work</span>
                <span className="display block text-[clamp(1.05rem,1.9vw,1.5rem)] uppercase leading-[1.5] tracking-[0.12em] text-ink">
                  Resham<span aria-hidden className="mx-2.5 inline-block h-1.5 w-1.5 rotate-45 bg-gold align-middle" />Zardozi<span aria-hidden className="mx-2.5 inline-block h-1.5 w-1.5 rotate-45 bg-gold align-middle" />Ari<span aria-hidden className="mx-2.5 inline-block h-1.5 w-1.5 rotate-45 bg-gold align-middle" />Cutdana<span aria-hidden className="mx-2.5 inline-block h-1.5 w-1.5 rotate-45 bg-gold align-middle" />Pitta Tiki
                </span>
                <span className="font-sans text-[0.6rem] uppercase tracking-[0.28em] text-ink/70">
                  See every craft <span aria-hidden>→</span>
                </span>
              </span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
