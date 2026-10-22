import { PageIntro } from "@/components/editorial/page-intro";
import { CatalogueRail } from "@/components/shop/catalogue-rail";
import { ProductSection } from "@/components/shop/product-section";
import {
  products,
  whatsNewCollections,
  whatsNewCrafts,
} from "@/lib/catalog";

export const metadata = {
  title: "What's New",
};

export default function WhatsNewPage() {
  const firstRow = products.slice(0, 3);
  const secondRow = products.slice(3, 6);

  return (
    <div className="inner-page pb-24">
      <PageIntro
        kicker="The season"
        title="What's New"
        lede="Nine pieces from the working table — cloth already embroidered, waiting for a body. The house does not flood a rail. It releases what the stitchers have finished."
        font="olgans"
      />

      <CatalogueRail
        label="Collections"
        items={[...whatsNewCollections]}
      />

      <ProductSection products={firstRow} />

      <CatalogueRail label="By craft" items={whatsNewCrafts} />

      <ProductSection
        products={secondRow}
        className="mx-auto max-w-[1400px] px-6 pt-14 md:px-10 md:pt-20"
      />
    </div>
  );
}
