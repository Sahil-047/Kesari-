import { CollectionView } from "@/components/editorial/collection-view";
import { productsByCategory } from "@/lib/catalog";

export const metadata = {
  title: "Womenswear",
};

export default function WomenswearPage() {
  return (
    <CollectionView
      kicker="Womenswear"
      title="Evening and day"
      lede="Jackets, blouses and a printed saree. The embroidery is kept to the places a hand would rest — collar, neck, pallu — so the cloth can still move."
      products={productsByCategory("womenswear")}
    />
  );
}
