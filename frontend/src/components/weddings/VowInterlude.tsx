"use client";

import ScrollWriteText from "@/components/ScrollWriteText";
import MehendiVine from "@/components/illustrations/MehendiVine";
import { VOW_LINE } from "@/lib/bridal-collections";

export default function VowInterlude() {
  return (
    <section
      className="relative z-10 flex min-h-[90vh] items-center justify-center overflow-hidden bg-parchment-light py-24"
      aria-label="The vow"
    >
      <div className="section-pad relative mx-auto w-full max-w-4xl text-center">
        <MehendiVine className="pointer-events-none absolute inset-x-0 top-1/2 mx-auto h-24 w-full max-w-3xl -translate-y-1/2 text-gold/60" />
        <ScrollWriteText
          as="h2"
          text={VOW_LINE}
          className="display relative z-[1] text-[clamp(2rem,5vw,4.5rem)] uppercase leading-[1.05] tracking-[0.1em] text-ink"
        />
      </div>
    </section>
  );
}
