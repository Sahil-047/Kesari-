import { PageIntro } from "@/components/editorial/page-intro";
import { ProductGrid } from "@/components/shop/product-grid";
import type { Product } from "@/lib/catalog";

type CollectionViewProps = {
  kicker: string;
  title: string;
  lede: string;
  products: Product[];
};

export function CollectionView({ kicker, title, lede, products }: CollectionViewProps) {
  return (
    <div className="inner-page">
      <PageIntro kicker={kicker} title={title} lede={lede} />
      <div className="mx-auto max-w-[1400px] px-6 pb-24 md:px-10">
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
