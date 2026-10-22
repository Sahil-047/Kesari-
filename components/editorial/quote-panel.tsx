import { GoldRule } from "@/components/paper/gold-rule";
import { houseQuote } from "@/lib/catalog";

export function QuotePanel() {
  return (
    <section className="relative px-6 py-28 md:px-10 md:py-36">
      <div className="mx-auto max-w-4xl text-center">
        <p className="nav-link text-gold">{houseQuote.kicker}</p>
        <GoldRule className="mt-6" />
        <blockquote className="mt-10 font-serif text-2xl leading-snug text-ink italic sm:text-3xl md:text-4xl md:leading-snug">
          {houseQuote.text}
        </blockquote>
      </div>
    </section>
  );
}
