import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import AutoLoopVideo from "@/components/AutoLoopVideo";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { getPageContent } from "@/lib/content/getPageContent";

export const metadata: Metadata = {
  title: "About the House | World of Kesari",
  description:
    "Meet Kesari by Bhumika Patel: an exploration of Indian craft, considered silhouettes, and the stories carried in every stitch.",
};

export default async function WorldOfKesariPage() {
  const { hero, story } = await getPageContent("world-of-kesari");

  return (
    <div className="site-shell">
      <main className="site-main">
        <section className="relative aspect-video w-full overflow-hidden md:min-h-[56dvh]">
          <AutoLoopVideo
            className="absolute inset-0 h-full w-full object-cover"
            src={hero.video}
            poster={hero.poster}
            aria-label={story.title}
          />
          <Header variant="overlay" />
          {hero.line ? (
            <div className="absolute inset-x-0 bottom-0 z-[2] bg-gradient-to-t from-ink/70 via-ink/25 to-transparent px-6 pb-10 pt-24 md:px-10 md:pb-14">
              <p className="mx-auto max-w-3xl text-center text-[0.95rem] leading-relaxed text-cream/90 md:text-[1.05rem]">
                {hero.line}
              </p>
            </div>
          ) : null}
        </section>

        <div className="section-pad pb-16 pt-6 md:pb-24 md:pt-10">
          <article
            aria-labelledby="about-kesari-title"
            className="mx-auto grid max-w-[1280px] overflow-hidden border border-gold/30 bg-transparent lg:grid-cols-[1fr_1.15fr]"
          >
            <div className="flex flex-col items-start px-7 py-10 sm:px-12 sm:py-14 lg:px-14 lg:py-16 xl:px-16">
              <p className="flex items-center gap-3 font-sans text-[0.65rem] uppercase tracking-[0.28em] text-ink-soft">
                <span className="khatam text-gold" aria-hidden />
                {story.eyebrow}
              </p>
              <h1
                id="about-kesari-title"
                className="display mt-6 text-[clamp(2.5rem,4.5vw,4rem)] leading-tight text-ink"
              >
                {story.title}
              </h1>

              <div className="mt-8 max-w-md space-y-5 font-sans text-[0.95rem] leading-[1.85] text-ink-soft">
                {story.intro.split(/\n\n+/).map((para) => (
                  <p key={para.slice(0, 48)}>{para}</p>
                ))}
              </div>

              <section
                aria-labelledby="house-philosophy-title"
                className="mt-8 max-w-md border-t border-gold/35 pt-6"
              >
                <h2 id="house-philosophy-title" className="display text-2xl leading-snug text-ink">
                  The House
                </h2>
                <p className="mt-4 font-sans text-[0.95rem] leading-[1.85] text-ink-soft">
                  {story.houseCopy}
                </p>
              </section>

              <div className="mt-auto pt-9">
                <Link href="/atelier" className="ww-explore">
                  Write to the house
                  <span className="ww-explore__arrow" aria-hidden />
                </Link>
              </div>
            </div>

            <figure className="order-first m-0 flex min-w-0 flex-col border-b border-gold/30 lg:border-b-0 lg:border-r">
              <div className="relative aspect-[2/3] w-full lg:aspect-auto lg:min-h-[760px] lg:flex-1">
                <Image
                  src={hero.poster}
                  alt=""
                  fill
                  quality={100}
                  sizes="(min-width: 1280px) 595px, (min-width: 1024px) 47vw, 100vw"
                  className="object-cover object-[50%_28%]"
                />
              </div>
              <figcaption className="flex flex-wrap items-center justify-between gap-3 border-t border-gold/30 px-7 py-5 font-sans text-[0.6rem] uppercase leading-relaxed tracking-[0.2em] text-ink-soft sm:px-8">
                <span>A study in colour, texture & detail</span>
                <span aria-hidden className="khatam text-gold" />
              </figcaption>
            </figure>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
