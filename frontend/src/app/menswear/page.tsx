import AutoLoopVideo from "@/components/AutoLoopVideo";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import MenswearBrowse from "@/components/MenswearBrowse";
import { getLiveProducts, getProductLinker, liveForPlacement } from "@/lib/api/storefront";
import { getPageContent } from "@/lib/content/getPageContent";
import {
  chaptersToMensCollections,
  type MensCollection,
  type MenswearChapter,
} from "@/lib/mens-collections";
import { productHref, productIdFromHref } from "@/lib/productLinks";
import Link from "next/link";
import { Suspense } from "react";

function chapterFromLive(p: {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  image: string;
  images?: string[];
}): MenswearChapter {
  const photos = [...new Set([p.image, ...(p.images ?? [])].filter(Boolean))];
  return {
    title: p.name,
    label: p.category,
    category: p.category,
    accent: "#c9a227",
    story: p.description,
    images: photos,
    link: productHref(p),
  };
}

export default async function MenswearPage() {
  const [content, linker, live] = await Promise.all([
    getPageContent("menswear"),
    getProductLinker(),
    getLiveProducts(),
  ]);
  const { hero, chapters } = content;

  const curated = chaptersToMensCollections(chapters.items, (item) =>
    linker.forPiece({
      name: item.title,
      images: item.images,
      fallback: linker.resolveHref(item.link && item.link !== "#" ? item.link : undefined, "/products"),
    }),
  );

  const linkedIds = new Set(curated.map((c) => productIdFromHref(c.href)).filter(Boolean));
  const linkedTitles = new Set(curated.map((c) => c.title.trim().toLowerCase()));
  const fromProducts = chaptersToMensCollections(
    liveForPlacement(live, "menswear.looks")
      .filter((p) => !linkedIds.has(p.id) && !linkedTitles.has(p.name.trim().toLowerCase()))
      .map(chapterFromLive),
    (item) => item.link,
  );

  const collections: MensCollection[] = [...curated, ...fromProducts];

  return (
    <div className="site-shell page-grain">
      <main className="site-main relative z-10">
        <section className="relative h-[68dvh] w-full overflow-hidden md:aspect-video md:h-auto md:min-h-[56dvh]">
          <Header variant="overlay" />
          <AutoLoopVideo
            className="absolute inset-0 h-full w-full object-cover"
            src={hero.video}
            poster={hero.poster}
            aria-label={hero.title}
          />
          <div className="absolute inset-0 z-[1] bg-black/25 md:bg-black/20" />
          <div className="absolute inset-x-0 bottom-0 z-[2] px-5 pb-10 text-center text-white md:hidden">
            <p className="font-sans text-[0.6rem] uppercase tracking-[0.35em] text-white/85">{hero.eyebrow}</p>
            <h1 className="display mt-2 text-[clamp(2rem,9vw,2.75rem)] uppercase tracking-[0.14em]">{hero.title}</h1>
          </div>
        </section>

        <section className="section-pad relative z-10 hidden pb-10 pt-16 text-center md:block">
          <p className="mb-4 font-sans text-[0.65rem] uppercase tracking-[0.32em] text-ink/70">{hero.eyebrow}</p>
          <h1 className="display text-[clamp(2.25rem,5vw,3.75rem)] uppercase tracking-[0.12em] text-ink">{hero.title}</h1>
        </section>

        <div className="section-pad relative z-10 flex justify-center py-7 md:pb-8 md:pt-0">
          <Link href="/products?category=menswear" className="ww-explore">
            Shop the collection <span className="ww-explore__arrow" aria-hidden />
          </Link>
        </div>

        <Suspense fallback={<MenswearBrowse collections={collections} />}>
          <MenswearBrowse collections={collections} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
