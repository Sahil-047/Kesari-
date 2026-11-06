import type { Metadata } from "next";
import { Suspense } from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ProductCatalogue from "@/components/ProductCatalogue";
import { catalogueCategory, getLiveProducts, liveForPlacement } from "@/lib/api/storefront";
import type { CatalogueProduct } from "@/lib/catalogue";
import { LOOKBOOK_PRODUCTS } from "@/lib/lookbook";
import { productHref } from "@/lib/productLinks";

const LOOKBOOK: CatalogueProduct[] = LOOKBOOK_PRODUCTS.map(({ id, name, category, garmentType, price, image }) => ({
  id, name, category, garmentType, price, image,
}));

/** CMS products checked for Shop first; lookbook fills only names the CMS does not cover. */
async function Catalogue() {
  const live = liveForPlacement(await getLiveProducts(), "shop");
  const liveNames = new Set(live.map((p) => p.name.trim().toLowerCase()));
  const fromCms: CatalogueProduct[] = live.map((p) => ({
    id: p.id,
    name: p.name,
    category: catalogueCategory(p.category),
    garmentType: p.category.trim().toLowerCase().replace(/\s+/g, "-") || "piece",
    price: p.price,
    image: p.image,
    href: productHref(p),
  }));
  // Once the house has live pieces, keep lookbook as filler only for unmatched names.
  const products: CatalogueProduct[] = [
    ...fromCms,
    ...LOOKBOOK.filter((p) => !liveNames.has(p.name.trim().toLowerCase())),
  ];
  return <ProductCatalogue products={products} />;
}

export const metadata: Metadata = {
  title: "All Pieces | Kesari by Bhumika Patel",
  description: "Explore the Kesari lookbook. Discover sarees, lehengas, dresses, and menswear, and find your piece by silhouette and price.",
};

export default function ProductsPage() {
  return (
    <div className="site-shell default-surface">
      <Header />
      <main className="site-main section-pad pb-20 pt-8 md:pb-28 md:pt-12">
        <div className="mx-auto max-w-[1680px]">
          <div className="mb-10 text-center md:mb-14">
            <p className="font-sans text-[0.65rem] uppercase tracking-[0.28em] text-ink-soft">The Kesari Lookbook</p>
            <h1 className="display mt-4 text-[clamp(2rem,4vw,3.25rem)] uppercase text-ink">All Pieces</h1>
            <p className="mx-auto mt-4 max-w-lg font-sans text-sm leading-relaxed text-ink-soft">Sarees, lehengas, dresses, and menswear. A world of craft, in every silhouette.</p>
          </div>
          <Suspense fallback={<p role="status" className="py-16 text-center font-sans text-sm text-ink-soft">Opening the collection…</p>}>
            <Catalogue />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
