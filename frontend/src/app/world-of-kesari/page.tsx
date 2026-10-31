import AutoLoopVideo from "@/components/AutoLoopVideo";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import CraftStoriesBento from "@/components/bento/CraftStoriesBento";
import { getPageContent } from "@/lib/content/getPageContent";

export default async function WorldOfKesariPage() {
  const { hero, story } = await getPageContent("world-of-kesari");

  return (
    <div className="site-shell page-grain">
      <main className="site-main relative z-10">
        <section className="relative aspect-video w-full overflow-hidden md:min-h-[56dvh]">
          <Header variant="overlay" />
          <AutoLoopVideo
            className="absolute inset-0 h-full w-full object-cover"
            src={hero.video}
            poster={hero.poster}
            aria-label="World of Kesari"
          />
          <div className="absolute inset-0 z-[1] bg-black/20" />
          <div className="section-pad absolute inset-0 z-[2] flex items-end pb-[10%] md:pb-[12%]">
            <p className="max-w-md text-sm leading-relaxed text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)] md:text-base">
              {hero.line}
            </p>
          </div>
          <div className="absolute inset-x-0 bottom-5 z-[2] text-center md:bottom-6">
            <p className="display text-sm uppercase tracking-[0.3em] text-gold drop-shadow">
              Kesari
            </p>
            <p className="script text-lg text-gold drop-shadow">
              by Bhumika Patel
            </p>
          </div>
        </section>

        <section className="section-pad py-24 text-center md:py-32">
          <div className="relative z-10 mx-auto max-w-3xl">
            <p className="eyebrow mb-4">{story.eyebrow}</p>
            <h1 className="display text-[clamp(1.75rem,4vw,3rem)] uppercase tracking-[0.16em] text-ink">
              {story.title}
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-ink-soft md:text-lg">
              {story.intro}
            </p>
            <span className="mx-auto my-10 hairline bg-gold" />
            <p className="display text-[clamp(1.1rem,2.2vw,1.55rem)] leading-relaxed text-ink">
              {story.houseCopy}
            </p>
          </div>
        </section>

        <CraftStoriesBento />
      </main>
      <Footer />
    </div>
  );
}
