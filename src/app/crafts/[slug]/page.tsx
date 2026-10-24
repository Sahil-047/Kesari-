import { Suspense } from "react";
import { notFound } from "next/navigation";
import AutoLoopVideo from "@/components/AutoLoopVideo";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import InsightsGallery from "@/components/InsightsGallery";
import MediaFrame, { toneForSlug } from "@/components/MediaFrame";
import ProductCard from "@/components/ProductCard";
import TechniqueSection from "@/components/TechniqueSection";
import {
  CRAFTS,
  EXPLORE_LOOK_SLUGS,
  getCraft,
  PRODUCTS,
} from "@/lib/data";

export function generateStaticParams() {
  return CRAFTS.map((c) => ({ slug: c.slug }));
}

export default function CraftDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<CraftFallback />}>
      <CraftDetail params={params} />
    </Suspense>
  );
}

function CraftFallback() {
  return null;
}

async function CraftDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const craft = getCraft(slug);
  if (!craft) notFound();

  const isExploreLook = (EXPLORE_LOOK_SLUGS as readonly string[]).includes(
    craft.slug,
  );

  const related = PRODUCTS.filter(
    (p) =>
      p.craft.toLowerCase().includes(craft.title.toLowerCase()) ||
      p.category.toLowerCase() === craft.label.toLowerCase(),
  ).slice(0, 3);
  const featured =
    related[0] ??
    PRODUCTS.find((p) => p.slug.includes(craft.slug)) ??
    PRODUCTS[0];

  return (
    <div className={`site-shell ${isExploreLook ? "page-grain" : ""}`}>
      <Header variant="overlay" />
      <main className="site-main relative z-10">
        <section
          className={
            craft.video
              ? "relative aspect-video w-full overflow-hidden md:min-h-[56dvh]"
              : "relative min-h-[70dvh] w-full overflow-hidden md:min-h-[75dvh]"
          }
        >
          {craft.video ? (
            <AutoLoopVideo
              className="absolute inset-0 h-full w-full object-cover"
              src={craft.video}
              poster={craft.videoPoster}
              aria-label={craft.title}
            />
          ) : (
            <MediaFrame
              src={craft.image || ""}
              alt={craft.title}
              tone={toneForSlug(craft.slug)}
              label={craft.title}
              priority
              quality={100}
              objectPosition={craft.imagePosition ?? "center"}
            />
          )}
          {craft.video ? null : (
            <div className="absolute inset-0 z-[1] bg-black/30" />
          )}
          <div
            className={`absolute inset-0 z-[2] flex items-end justify-center text-white ${
              craft.video
                ? "pb-[10%] md:pb-[12%]"
                : "pb-[10vh] md:pb-[12vh]"
            }`}
          >
            <div className="flex flex-col items-center px-6 text-center drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]">
              <p className="font-sans text-[0.6rem] uppercase tracking-[0.35em] text-white/90">
                {craft.label}
              </p>
              <h1 className="display mt-3 text-[clamp(1.75rem,4.5vw,3rem)] uppercase tracking-[0.18em]">
                {craft.title}
              </h1>
              {craft.subtitle ? (
                <p className="mt-3 max-w-md text-sm text-white/90 md:text-base">
                  {craft.subtitle}
                </p>
              ) : null}
            </div>
          </div>
        </section>

        {craft.gallery && craft.gallery.length > 0 ? (
          <InsightsGallery images={craft.gallery} title="Catalogue" />
        ) : (
          <TechniqueSection
            craft={craft}
            product={featured}
            showIntro={!isExploreLook}
          />
        )}

        {related.length > 0 && !isExploreLook ? (
          <section className="parchment-surface section-pad pb-20">
            <p className="eyebrow mb-10 text-center">Also From The House</p>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 sm:grid-cols-3">
              {related.map((p) => (
                <ProductCard key={p.slug} product={p} overlay="side" />
              ))}
            </div>
          </section>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
