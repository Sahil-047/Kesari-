import { ProductCard } from "@/components/shop/product-card";
import type { Product } from "@/lib/catalog";

type ProductSectionProps = {
  products: Product[];
  className?: string;
};

export function ProductSection({ products, className }: ProductSectionProps) {
  if (!products.length) return null;

  return (
    <section className={className ?? "mx-auto max-w-[1400px] px-6 py-14 md:px-10 md:py-20"}>
      <div className="grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-3">
        {products.slice(0, 3).map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </section>
  );
}
