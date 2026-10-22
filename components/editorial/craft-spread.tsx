import Image from "next/image";
import Link from "next/link";
import { GoldRule } from "@/components/paper/gold-rule";
import type { Craft } from "@/lib/catalog";
import { classNames } from "@/lib/format";

export function CraftSpread({
  craft,
  index,
}: {
  craft: Craft;
  index: number;
}) {
  const reverse = index % 2 === 1;

  return (
    <article
      className={classNames(
        "grid items-stretch overflow-hidden border border-gold/20 md:grid-cols-2",
        reverse ? "md:[&>*:first-child]:order-2" : "",
      )}
    >
      <Link href={`/crafts/${craft.slug}`} className="relative min-h-[420px] md:min-h-[560px]">
        <Image
          src={craft.image}
          alt={craft.name}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover"
          style={{ objectPosition: craft.position }}
        />
      </Link>
      <div className="flex flex-col justify-center px-8 py-12 md:px-12">
        {craft.kicker ? (
          <p className="nav-link text-gold">{craft.kicker}</p>
        ) : null}
        <h2
          className={`display-title text-3xl text-ink md:text-4xl ${craft.kicker ? "mt-4" : ""}`}
        >
          {craft.name}
        </h2>
        <GoldRule align="left" className="mt-6" />
        <p className="mt-6 max-w-md font-serif text-xl leading-relaxed text-ink-soft">
          {craft.statement}
        </p>
        <Link href={`/crafts/${craft.slug}`} className="outline-btn mt-8 w-fit text-ink">
          The work
        </Link>
      </div>
    </article>
  );
}
