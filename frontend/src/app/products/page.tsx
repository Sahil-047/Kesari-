import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ProductCatalogue from "@/components/ProductCatalogue";
import { LOOKBOOK_PRODUCTS } from "@/lib/lookbook";

export const metadata: Metadata = {
  title: "All Pieces | Kesari by Bhumika Patel",
  description: "Explore the Kesari lookbook. Discover sarees, lehengas, dresses, and menswear, and find your piece by silhouette and price.",
};

export default function ProductsPage() {
  const products = LOOKBOOK_PRODUCTS.map(({ id, name, category, garmentType, price, image }) => ({
    id, name, category, garmentType, price, image,
  }));

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
          <ProductCatalogue products={products} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
