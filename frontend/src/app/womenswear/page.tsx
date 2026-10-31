import AutoLoopVideo from "@/components/AutoLoopVideo";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { getPageContent } from "@/lib/content/getPageContent";
import WomenswearBrowse from "@/components/WomenswearBrowse";
import { WOMENS_CATEGORIES } from "@/lib/color-collections";
import { Suspense } from "react";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

/** Reads ?category= so links like /womenswear?category=saree open filtered. */
async function BrowseForCategory({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { category } = await searchParams;
  const initialCategory = WOMENS_CATEGORIES.find((c) => c.id === category)?.id;
  return <WomenswearBrowse initialCategory={initialCategory} />;
}

export default async function WomenswearPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { hero } = await getPageContent("womenswear");

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
            <p className="font-sans text-[0.6rem] uppercase tracking-[0.35em] text-white/85">
              {hero.eyebrow}
            </p>
            <h1 className="display mt-2 text-[clamp(2rem,9vw,2.75rem)] uppercase tracking-[0.14em]">
              {hero.title}
            </h1>
          </div>
        </section>

        <section className="section-pad relative z-10 hidden pb-10 pt-16 text-center md:block">
          <p className="mb-4 font-sans text-[0.65rem] uppercase tracking-[0.32em] text-ink/70">
            {hero.eyebrow}
          </p>
          <h1 className="display text-[clamp(2.25rem,5vw,3.75rem)] uppercase tracking-[0.12em] text-ink">
            {hero.title}
          </h1>
        </section>

        <Suspense fallback={<WomenswearBrowse />}>
          <BrowseForCategory searchParams={searchParams} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
