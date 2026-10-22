"use client";

import { CatalogueCard, type CatalogueItem } from "@/components/shop/catalogue-card";

type CatalogueRailProps = {
  items: CatalogueItem[];
  label?: string;
};

export function CatalogueRail({ items, label }: CatalogueRailProps) {
  return (
    <section className="relative py-4 md:py-6" aria-label={label}>
      {label ? (
        <p className="nav-link mb-5 px-6 text-gold md:px-10">{label}</p>
      ) : null}
      <div className="catalogue-rail flex gap-4 overflow-x-auto px-6 pb-4 md:gap-5 md:px-10">
        {items.map((item) => (
          <CatalogueCard key={`${item.href}-${item.title}`} item={item} />
        ))}
      </div>
    </section>
  );
}
