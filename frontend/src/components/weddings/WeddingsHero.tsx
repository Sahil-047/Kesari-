"use client";

import AutoLoopVideo from "@/components/AutoLoopVideo";
import Header from "@/components/Header";
import ScrollWriteText from "@/components/ScrollWriteText";
import type { WeddingsContent } from "@/lib/content/pages";

export default function WeddingsHero({ hero }: { hero: WeddingsContent["hero"] }) {
  return (
    <section className="relative h-[100dvh] w-full overflow-hidden bg-parchment-light">
      <Header variant="overlay" />
      <AutoLoopVideo
        className="absolute inset-0 h-full w-full object-cover"
        src={hero.video}
        poster={hero.poster}
        aria-label={hero.title}
      />
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-ink/70 via-ink/15 to-ink/20" />

      <div className="absolute inset-x-0 bottom-0 z-[2] section-pad pb-12 md:pb-16">
        <div className="mx-auto max-w-[1680px]">
          <p className="font-sans text-[0.6rem] uppercase tracking-[0.36em] text-cream/80">
            {hero.eyebrow}
          </p>
          <ScrollWriteText
            as="h1"
            text={hero.title}
            className="display mt-3 max-w-[10ch] text-[clamp(2.75rem,9vw,6.5rem)] uppercase leading-[0.9] tracking-[0.08em] text-cream"
          />
          <p className="mt-5 max-w-md text-[1.02rem] leading-relaxed text-cream/80">
            {hero.line}
          </p>
        </div>
      </div>
    </section>
  );
}
