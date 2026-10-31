import Footer from "@/components/Footer";
import HomeHero from "@/components/HomeHero";
import HomeShowcase from "@/components/HomeShowcase";
import { getPageContent } from "@/lib/content/getPageContent";

export default async function HomePage() {
  const content = await getPageContent("home");

  return (
    <div className="site-shell">
      <main className="site-main">
        <HomeHero hero={content.hero} />
        <HomeShowcase />
      </main>
      <Footer />
    </div>
  );
}
