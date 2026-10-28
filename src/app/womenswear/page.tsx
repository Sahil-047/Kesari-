import AutoLoopVideo from "@/components/AutoLoopVideo";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import WomenswearBrowse from "@/components/WomenswearBrowse";

export default function WomenswearPage() {
  return (
    <div className="site-shell page-grain">
      <main className="site-main relative z-10">
        <section className="relative h-[68dvh] w-full overflow-hidden md:aspect-video md:h-auto md:min-h-[56dvh]">
          <Header variant="overlay" />
          <AutoLoopVideo
            className="absolute inset-0 h-full w-full object-cover"
            src="/videos/womenswear.mp4"
            poster="/images/womenswear-poster.jpg"
            aria-label="Womenswear"
          />
          <div className="absolute inset-0 z-[1] bg-black/25 md:bg-black/20" />
          <div className="absolute inset-x-0 bottom-0 z-[2] px-5 pb-10 text-center text-white md:hidden">
            <p className="font-sans text-[0.6rem] uppercase tracking-[0.35em] text-white/85">
              Collections
            </p>
            <h1 className="display mt-2 text-[clamp(2rem,9vw,2.75rem)] uppercase tracking-[0.14em]">
              Womenswear
            </h1>
          </div>
        </section>

        <section className="section-pad relative z-10 hidden pb-10 pt-16 text-center md:block">
          <p className="mb-4 font-sans text-[0.65rem] uppercase tracking-[0.32em] text-ink/70">
            Collections
          </p>
          <h1 className="display text-[clamp(2.25rem,5vw,3.75rem)] uppercase tracking-[0.12em] text-ink">
            Womenswear
          </h1>
        </section>

        <WomenswearBrowse />
      </main>
      <Footer />
    </div>
  );
}
