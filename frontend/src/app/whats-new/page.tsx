import Footer from "@/components/Footer";
import Header from "@/components/Header";
import WhatsNewExperience from "@/components/WhatsNewExperience";
import { getLiveProducts, getProductLinker, liveForPlacement, liveProductAsEditItem } from "@/lib/api/storefront";
import { getPageContent } from "@/lib/content/getPageContent";
import { productIdFromHref } from "@/lib/productLinks";

export default async function WhatsNewPage() {
  const [content, links, live] = await Promise.all([
    getPageContent("whats-new"),
    getProductLinker(),
    getLiveProducts(),
  ]);

  // Curated Edit items first, then products checked for What's New → The Edit.
  const curated = content.edit.items.map((item) => ({
    ...item,
    link: links.forPiece({
      name: item.name,
      images: item.image ? [item.image] : [],
      fallback: links.resolveHref(item.link && item.link !== "#" ? item.link : undefined, "/products"),
    }),
  }));
  const linkedIds = new Set(curated.map((item) => productIdFromHref(item.link)).filter(Boolean));
  const linkedNames = new Set(curated.map((item) => item.name.trim().toLowerCase()));
  const fromProducts = liveForPlacement(live, "whats-new.edit")
    .filter((p) => !linkedIds.has(p.id) && !linkedNames.has(p.name.trim().toLowerCase()))
    .map(liveProductAsEditItem);

  const edit = {
    ...content.edit,
    items: [...curated, ...fromProducts],
  };

  return (
    <div className="site-shell page-grain">
      <main className="site-main relative z-10">
        <WhatsNewExperience header={<Header variant="overlay" />} content={{ ...content, edit }} />
      </main>
      <Footer />
    </div>
  );
}
