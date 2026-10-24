import Link from "next/link";
import AutoLoopVideo from "@/components/AutoLoopVideo";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import MediaFrame, { toneForSlug } from "@/components/MediaFrame";
import ColorCollectionRails from "@/components/ColorCollectionRails";
import { PRODUCTS, WHATS_NEW_INTRO } from "@/lib/data";

/** Nine looks — portrait only (no 16:9) */
const CATEGORY_TILES = [
  { slug: PRODUCTS[0].slug, image: "/images/deep-plum/insight-1.jpg" },
  { slug: PRODUCTS[1].slug, image: "/images/LIGHT PINK/DSC07213.jpg" },
  { slug: PRODUCTS[2].slug, image: "/images/OFF WHITE/DSC07237.jpg" },
  { slug: PRODUCTS[3].slug, image: "/images/ORANGE/DSC05475.jpg" },
  { slug: PRODUCTS[4].slug, image: "/images/ORANGE/DSC07568.jpg" },
  { slug: PRODUCTS[5].slug, image: "/images/PINK/DSC06150.jpg" },
  { slug: PRODUCTS[6].slug, image: "/images/soft-bridal/insight-3.jpg" },
  { slug: PRODUCTS[7].slug, image: "/images/Wedding/DSC05328.jpg" },
  { slug: PRODUCTS[8].slug, image: "/images/VIOLET/DSC06468.jpg" },
];

export default function WhatsNewPage() {
  return (
    <div className="site-shell page-grain">
      <main className="site-main relative z-10">
        <section className="relative aspect-video w-full overflow-hidden md:min-h-[56dvh]">
          <Header variant="overlay" />
          <AutoLoopVideo
            className="absolute inset-0 h-full w-full object-cover"
            src="/videos/whats-new.mp4"
            poster="/images/whats-new-poster.jpg"
            aria-label="What's New"
          />
          <div className="absolute inset-0 z-[1] bg-black/20" />
        </section>

        <section className="section-pad relative z-10 pb-10 pt-12 text-center md:pb-12 md:pt-16">
          <p className="eyebrow mb-4">The Season</p>
          <h1 className="display text-[clamp(2.25rem,5vw,3.75rem)] uppercase tracking-[0.12em] text-ink">
            What&apos;s New
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-[1.05rem] leading-relaxed text-ink-soft md:text-lg">
            {WHATS_NEW_INTRO}
          </p>
        </section>

        <section className="relative z-10 pb-14 md:pb-20">
          <div className="rail-hide-scroll section-pad">
            {CATEGORY_TILES.map((tile) => {
              const product = PRODUCTS.find((p) => p.slug === tile.slug);
              return (
                <Link
                  key={tile.slug}
                  href={`/product/${tile.slug}`}
                  className="relative aspect-square w-[42vw] max-w-[220px] min-w-[160px] overflow-hidden sm:w-[200px] md:w-[220px]"
                  aria-label={product?.name ?? tile.slug}
                >
                  <MediaFrame
                    src={tile.image}
                    alt={product?.name ?? ""}
                    tone={toneForSlug(tile.slug)}
                    quality={100}
                    sizes="220px"
                  />
                </Link>
              );
            })}
          </div>
        </section>

        <ColorCollectionRails />
      </main>
      <Footer />
    </div>
  );
}
