import Footer from "@/components/Footer";
import HomeHero from "@/components/HomeHero";
import HomeShowcase from "@/components/HomeShowcase";
import { getLiveProducts, liveForPlacement } from "@/lib/api/storefront";
import { getPageContent } from "@/lib/content/getPageContent";
import { HOUSE_TILES, type HouseTile } from "@/lib/home";
import { createProductLinker } from "@/lib/productLinks";

export default async function HomePage() {
  const [content, live] = await Promise.all([getPageContent("home"), getLiveProducts()]);
  const links = createProductLinker(live);

  // Home placement only swaps the tile photograph — Soft Bridal / Warm Saffron /
  // Midnight Bloom keep their fixed titles, labels and destinations.
  const homeImages = liveForPlacement(live, "home")
    .map((p) => p.image)
    .filter(Boolean);
  const tiles: HouseTile[] = HOUSE_TILES.map((fallback, i) => ({
    ...fallback,
    href: links.resolveHref(fallback.href),
    ...(homeImages[i] ? { image: homeImages[i]! } : {}),
  }));

  return (
    <div className="site-shell default-surface parchment-noise">
      <main className="site-main">
        <HomeHero hero={{ ...content.hero, link: links.resolveHref(content.hero.link) }} />
        <HomeShowcase tiles={tiles} />
      </main>
      <Footer />
    </div>
  );
}
