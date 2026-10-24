import CraftFeature from "@/components/CraftFeature";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import PageHero from "@/components/PageHero";
import { CRAFTS, CRAFTS_INTRO } from "@/lib/data";

const ORDER = [
  "resham",
  "mirror-zardoshi",
  "cutdana",
  "brocade",
  "pitta-tiki",
  "pitta-print",
  "ari-zardoshi",
  "zardozi",
  "hand-print-pitta",
];

export default function CraftsPage() {
  const featured = ORDER.map((slug) =>
    CRAFTS.find((c) => c.slug === slug),
  ).filter(Boolean);

  return (
    <div className="site-shell">
      <Header />
      <main className="site-main relative parchment-surface parchment-noise">
        <PageHero eyebrow="The Work" title="Crafts">
          <p className="italic">{CRAFTS_INTRO}</p>
        </PageHero>

        <div className="relative z-10 pb-8 md:pb-12">
          {featured.map((craft, i) =>
            craft ? (
              <CraftFeature
                key={craft.slug}
                craft={craft}
                reverse={i % 2 === 1}
              />
            ) : null,
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
