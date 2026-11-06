import Footer from "@/components/Footer";
import HomeHero from "@/components/HomeHero";
import HomeShowcase from "@/components/HomeShowcase";
import { getLiveProducts, liveForPlacement } from "@/lib/api/storefront";
import { getPageContent } from "@/lib/content/getPageContent";
import { HOUSE_TILES, type HouseTile } from "@/lib/home";
import { createProductLinker, productHref } from "@/lib/productLinks";

export default async function HomePage() {
  const [content, live] = await Promise.all([getPageContent("home"), getLiveProducts()]);
  const links = createProductLinker(live);

  // Products checked for Home fill The House tiles; static looks fill the rest.
  const featured: HouseTile[] = liveForPlacement(live, "home").map((p) => ({
    href: productHref(p),
    image: p.image,
    eyebrow: p.category,
    title: p.name,
  }));
  const tiles = HOUSE_TILES.map(
    (fallback, i) => featured[i] ?? { ...fallback, href: links.resolveHref(fallback.href) },
  );

  return (
    <div className="site-shell">
      <main className="site-main">
        <HomeHero hero={{ ...content.hero, link: links.resolveHref(content.hero.link) }} />
        <HomeShowcase tiles={tiles} />
      </main>
      <Footer />
    </div>
  );
}
