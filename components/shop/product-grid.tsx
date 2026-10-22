import { ProductCard } from "@/components/shop/product-card";
import type { Product } from "@/lib/catalog";

export function ProductGrid({ products }: { products: Product[] }) {
  if (!products.length) {
    return (
      <p className="px-6 py-20 text-center font-serif text-xl text-ink-soft">
        Nothing is showing in this room yet.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.slug} product={product} />
      ))}
    </div>
  );
}
