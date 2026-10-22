"use client";

import Image from "next/image";
import Link from "next/link";

export type CatalogueItem = {
  href: string;
  title: string;
  kicker: string;
  image: string;
  position?: string;
};

export function CatalogueCard({ item }: { item: CatalogueItem }) {
  return (
    <Link
      href={item.href}
      className="group relative block h-[52vw] min-h-[280px] w-[72vw] max-h-[420px] shrink-0 overflow-hidden sm:h-[380px] sm:w-[320px] md:h-[440px] md:w-[380px]"
    >
      <Image
        src={item.image}
        alt=""
        fill
        sizes="(min-width: 768px) 380px, 72vw"
        className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04]"
        style={{ objectPosition: item.position ?? "center" }}
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/15 to-transparent"
        aria-hidden="true"
      />
      <div className="absolute inset-x-0 bottom-0 px-6 pb-6">
        <p className="nav-link text-gold-light">{item.kicker}</p>
        <h3 className="olgans-title mt-2 text-2xl text-cream md:text-3xl">
          {item.title}
        </h3>
      </div>
    </Link>
  );
}
