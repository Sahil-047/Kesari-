import Link from "next/link";
import MediaFrame, { toneForSlug } from "./MediaFrame";

export type RailCard = {
  href: string;
  title: string;
  label: string;
  note?: string;
  image?: string;
  slug?: string;
};

export default function CollectionRail({ cards }: { cards: RailCard[] }) {
  return (
    <div className="card-rail section-pad mx-auto max-w-7xl">
      {cards.map((card) => (
        <Link
          key={card.href + card.title}
          href={card.href}
          className="group relative aspect-[3/4] w-[72vw] max-w-[300px] min-w-[240px] overflow-hidden sm:w-[260px] md:w-[300px]"
        >
          <MediaFrame
            src={card.image || ""}
            alt={card.title}
            tone={toneForSlug(card.slug || card.href)}
            label={card.title}
            className="transition duration-700 group-hover:scale-[1.02]"
            sizes="300px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
          {card.note ? (
            <p className="absolute inset-x-0 top-4 px-4 text-xs leading-relaxed text-white/85">
              {card.note}
            </p>
          ) : null}
          <div className="absolute inset-x-0 bottom-0 p-4 text-white md:p-5">
            <p className="eyebrow text-gold-soft">{card.label}</p>
            <h2 className="display mt-1.5 text-xl leading-tight md:text-2xl">
              {card.title}
            </h2>
          </div>
        </Link>
      ))}
    </div>
  );
}
