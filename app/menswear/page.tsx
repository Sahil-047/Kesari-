import { CollectionView } from "@/components/editorial/collection-view";
import { productsByCategory } from "@/lib/catalog";

export const metadata = {
  title: "Menswear",
};

export default function MenswearPage() {
  return (
    <CollectionView
      kicker="Heritage menswear"
      title="Cut close"
      lede="Waistcoats and light jackets, printed and then stitched. Menswear in this house is not a louder copy of the bridal work. It is the same garden, drawn smaller."
      products={productsByCategory("menswear")}
    />
  );
}
