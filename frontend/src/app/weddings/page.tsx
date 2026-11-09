import Footer from "@/components/Footer";
import BridalMoments from "@/components/weddings/BridalMoments";
import LookManifest from "@/components/weddings/LookManifest";
import Threshold from "@/components/weddings/Threshold";
import WeddingsHero from "@/components/weddings/WeddingsHero";
import { getPageContent } from "@/lib/content/getPageContent";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPageContent("weddings");
  return {
    title: `${content.hero.title} | Kesari`,
    description: content.hero.line || "Bridal cloth for a long evening and a longer photograph.",
  };
}

export default async function WeddingsPage() {
  const content = await getPageContent("weddings");

  return (
    <div className="site-shell page-grain">
      <main className="site-main relative z-10">
        <WeddingsHero hero={content.hero} />
        <BridalMoments content={content.moments} />
        <LookManifest content={content.collections} />
        <Threshold content={content.closing} />
      </main>
      <Footer />
    </div>
  );
}
