import AutoLoopVideo from "@/components/AutoLoopVideo";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import WeddingsExperience from "@/components/WeddingsExperience";

export default function WeddingsPage() {
  return (
    <div className="site-shell page-grain">
      <main className="site-main relative z-10">
        <section className="relative h-[78dvh] w-full overflow-hidden md:h-auto md:aspect-video md:min-h-[64dvh]">
          <Header variant="overlay" />
          <AutoLoopVideo
            className="absolute inset-0 h-full w-full object-cover"
            src="/videos/soft-bridal.mp4"
            poster="/images/soft-bridal-poster.jpg"
            aria-label="Weddings"
          />
          <div className="absolute inset-0 z-[1] bg-gradient-to-t from-ink/70 via-ink/20 to-ink/25" />
          <div className="absolute inset-x-0 bottom-0 z-[2] section-pad pb-12 text-cream md:pb-16">
            <div className="mx-auto max-w-[1680px]">
              <p className="font-sans text-[0.6rem] uppercase tracking-[0.36em] text-cream/85">
                Weddings
              </p>
              <h1 className="display mt-3 max-w-4xl text-[clamp(2.4rem,8vw,5.5rem)] uppercase leading-[0.92] tracking-[0.1em]">
                Soft Bridal
              </h1>
              <p className="mt-4 max-w-md text-[1.02rem] leading-relaxed text-cream/80 md:text-[1.08rem]">
                Bridal cloth for a long evening — and a longer photograph.
              </p>
            </div>
          </div>
        </section>

        <WeddingsExperience />
      </main>
      <Footer />
    </div>
  );
}
