import AutoLoopVideo from "@/components/AutoLoopVideo";
import BridalCollectionRails from "@/components/BridalCollectionRails";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { WEDDINGS_INTRO } from "@/lib/data";

export default function WeddingsPage() {
  return (
    <div className="site-shell page-grain">
      <main className="site-main relative z-10">
        <section className="relative aspect-video w-full overflow-hidden md:min-h-[56dvh]">
          <Header variant="overlay" />
          <AutoLoopVideo
            className="absolute inset-0 h-full w-full object-cover"
            src="/videos/soft-bridal.mp4"
            poster="/images/soft-bridal-poster.jpg"
            aria-label="Weddings"
          />
          <div className="absolute inset-0 z-[2] flex items-end justify-center pb-[10%] text-white md:pb-[12%]">
            <div className="flex flex-col items-center px-6 text-center drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]">
              <p className="font-sans text-[0.6rem] uppercase tracking-[0.35em] text-white/90">
                Wedding
              </p>
              <h1 className="display mt-3 text-[clamp(1.75rem,4.5vw,3rem)] uppercase tracking-[0.18em]">
                Soft Bridal
              </h1>
            </div>
          </div>
        </section>

        <section className="section-pad relative z-10 pb-10 pt-12 text-center md:pb-12 md:pt-16">
          <p className="mx-auto max-w-2xl text-[1.05rem] leading-relaxed text-ink-soft md:text-lg">
            {WEDDINGS_INTRO}
          </p>
        </section>

        <BridalCollectionRails />
      </main>
      <Footer />
    </div>
  );
}
