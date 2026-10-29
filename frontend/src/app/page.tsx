import Footer from "@/components/Footer";
import HomeHero from "@/components/HomeHero";
import HomeShowcase from "@/components/HomeShowcase";
export default function HomePage() {
  return (
    <div className="site-shell">
      <main className="site-main">
        <HomeHero />
        <HomeShowcase />
      </main>
      <Footer />
    </div>
  );
}
