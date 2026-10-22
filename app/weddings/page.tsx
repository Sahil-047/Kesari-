import { CollectionView } from "@/components/editorial/collection-view";
import { productsByCategory } from "@/lib/catalog";

export const metadata = {
  title: "Weddings",
};

export default function WeddingsPage() {
  return (
    <CollectionView
      kicker="Weddings"
      title="The bridal room"
      lede="Lehenga panels, a veil of mirrors, velvet zardozi. Bridal cloth is built for a long evening and a longer photograph. Appointments are taken before a commission is cut."
      products={productsByCategory("weddings")}
    />
  );
}
