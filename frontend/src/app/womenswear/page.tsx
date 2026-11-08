import AutoLoopVideo from "@/components/AutoLoopVideo";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import WomenswearBrowse from "@/components/WomenswearBrowse";
import { catalogueCategory, getLiveProducts, getProductLinker, liveForPlacement } from "@/lib/api/storefront";
import {
  chaptersToCollections,
  type ColorCollection,
  type WomenswearChapter,
  WOMENS_CATEGORIES,
} from "@/lib/color-collections";
import { getPageContent } from "@/lib/content/getPageContent";
import type { CollectionEdit } from "@/lib/content/pages";
import { productHref, productIdFromHref } from "@/lib/productLinks";
import Link from "next/link";
import { Suspense } from "react";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

/** Reads ?category= so links like /womenswear?category=saree open filtered. */
async function BrowseForCategory({
  searchParams,
  collections,
  edit,
}: {
  searchParams: SearchParams;
  collections: ColorCollection[];
  edit: CollectionEdit;
}) {
  const { category } = await searchParams;
  const raw = typeof category === "string" ? category : undefined;
  const initialCategory = WOMENS_CATEGORIES.find((c) => c.id === raw)?.id
    ?? (edit.items.some((c) => c.id === raw)
      ? (raw as (typeof WOMENS_CATEGORIES)[number]["id"])
      : undefined);
  return (
    <WomenswearBrowse
      initialCategory={initialCategory}
      collections={collections}
      edit={edit}
    />
  );
}

function chapterFromLive(p: {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  image: string;
  images?: string[];
}): WomenswearChapter {
  const photos = [...new Set([p.image, ...(p.images ?? [])].filter(Boolean))];
  return {
    title: p.name,
    label: p.category,
    category: catalogueCategory(p.category),
    accent: "#c9a227",
    story: p.description,
    images: photos,
    link: productHref(p),
  };
}

export default async function WomenswearPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const [content, linker, live] = await Promise.all([
    getPageContent("womenswear"),
    getProductLinker(),
    getLiveProducts(),
  ]);
  const { hero, edit, chapters } = content;

  const curated = chaptersToCollections(chapters.items, (item) =>
    linker.forPiece({
      name: item.title,
      images: item.images,
      fallback: linker.resolveHref(item.link && item.link !== "#" ? item.link : undefined, "/products"),
    }),
  );

  const linkedIds = new Set(curated.map((c) => productIdFromHref(c.href)).filter(Boolean));
  const linkedTitles = new Set(curated.map((c) => c.title.trim().toLowerCase()));
  const fromProducts = chaptersToCollections(
    liveForPlacement(live, "womenswear.chapters")
      .filter((p) => !linkedIds.has(p.id) && !linkedTitles.has(p.name.trim().toLowerCase()))
      .map(chapterFromLive),
    (item) => item.link,
  );

  const collections = [...curated, ...fromProducts];

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
          <Link href="/products?category=womenswear" className="ww-explore">
            Shop the collection <span className="ww-explore__arrow" aria-hidden />
          </Link>
        </div>

        <Suspense fallback={<WomenswearBrowse collections={collections} edit={edit} />}>
          <BrowseForCategory searchParams={searchParams} collections={collections} edit={edit} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
