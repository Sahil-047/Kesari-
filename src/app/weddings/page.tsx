import Footer from "@/components/Footer";
import BridalMoments from "@/components/weddings/BridalMoments";
import LookManifest from "@/components/weddings/LookManifest";
import WeddingsHero from "@/components/weddings/WeddingsHero";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Weddings · Soft Bridal | Kesari",
  description:
    "Bridal cloth for a long evening and a longer photograph. Soft Bridal at Kesari.",
};

export default function WeddingsPage() {
  return (
    <div className="site-shell page-grain">
      <main className="site-main relative z-10">
        <WeddingsHero />
        <BridalMoments />
        <LookManifest />
      </main>
      <Footer />
    </div>
  );
}
