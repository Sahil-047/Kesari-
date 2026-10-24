import Footer from "@/components/Footer";
import HomeHero from "@/components/HomeHero";
import HomeShowcase from "@/components/HomeShowcase";
import IntroSplash from "@/components/IntroSplash";

export default function HomePage() {
  return (
    <div className="site-shell">
      <IntroSplash />
      <main className="site-main">
        <HomeHero />
        <HomeShowcase />
      </main>
      <Footer />
    </div>
  );
}
