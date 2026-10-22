import Image from "next/image";
import { GoldRule } from "@/components/paper/gold-rule";
import { PageIntro } from "@/components/editorial/page-intro";
import { house } from "@/lib/site";

export const metadata = {
  title: "World of Kesari",
};

export default function WorldPage() {
  return (
    <div>
      <div className="relative h-[62svh] min-h-[420px] overflow-hidden">
        <Image
          src="/images/zardozi-work.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: "right center" }}
        />
        <div className="cinema-scrim absolute inset-0" />
        <div className="relative z-10 flex h-full flex-col items-center justify-end px-6 pb-12 text-center">
          <p className="brand-mark text-sm text-cream md:text-base">{house.name}</p>
          <p className="script-line mt-2 text-3xl text-gold-light">
            by {house.designer}
          </p>
        </div>
      </div>

      <PageIntro
        kicker="World of Kesari"
        title="A house of stitch"
        lede="Kesari takes its name from saffron — the colour of a late afternoon on old paper, and of the thread that still holds a garment together after the season has gone."
      />

      <section className="mx-auto grid max-w-[1100px] gap-12 px-6 pb-24 md:grid-cols-2 md:px-10">
        <article>
          <p className="nav-link text-gold">The designer</p>
          <h2 className="mt-4 font-serif text-3xl text-ink">Bhumika Patel</h2>
          <GoldRule align="left" className="mt-5" />
          <p className="mt-6 font-serif text-xl leading-relaxed text-ink-soft">
            The clothes are drawn as rooms would be: a dark wall, a gold
            moulding, a quiet floor. Bhumika Patel works with karigars who still
            sit to the frame — ari, zardozi, resham — and she refuses to treat
            that labour as a surface. The stitch is the architecture.
          </p>
        </article>
        <article>
          <p className="nav-link text-gold">The method</p>
          <h2 className="mt-4 font-serif text-3xl text-ink">Slow on purpose</h2>
          <GoldRule align="left" className="mt-5" />
          <p className="mt-6 font-serif text-xl leading-relaxed text-ink-soft">
            A panel may take weeks. Mirrors are set in metal, not pasted.
            Prints are pulled by hand, then outlined in pitta tiki so the colour
            has a soaked depth. Nothing here is a motif downloaded onto cloth.
            If it cannot be read at arm&apos;s length, it is not finished.
          </p>
        </article>
      </section>

      <section className="mx-auto max-w-[1100px] px-6 pb-28 md:px-10">
        <div className="grid overflow-hidden border border-gold/25 md:grid-cols-2">
          <div className="relative min-h-[360px]">
            <Image
              src="/images/handprint-pitta.jpg"
              alt=""
              fill
              sizes="50vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-center bg-ink px-8 py-12 text-cream md:px-12">
            <p className="nav-link text-gold-light">Craft preservation</p>
            <p className="mt-6 font-serif text-2xl leading-relaxed italic">
              Same traditions. New stories. The house keeps the old work alive
              by cutting it for a present body — not by locking it in a vitrine.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
