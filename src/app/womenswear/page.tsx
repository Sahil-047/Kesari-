import AutoLoopVideo from "@/components/AutoLoopVideo";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ColorCollectionRails from "@/components/ColorCollectionRails";

export default function WomenswearPage() {
  return (
    <div className="site-shell page-grain">
      <main className="site-main relative z-10">
        <section className="relative aspect-video w-full overflow-hidden md:min-h-[56dvh]">
          <Header variant="overlay" />
          <AutoLoopVideo
            className="absolute inset-0 h-full w-full object-cover"
            src="/videos/womenswear.mp4"
            poster="/images/womenswear-poster.jpg"
            aria-label="Womenswear"
          />
          <div className="absolute inset-0 z-[1] bg-black/20" />
        </section>

        <section className="section-pad relative z-10 pb-10 pt-12 text-center md:pb-12 md:pt-16">
          <p className="eyebrow mb-4">Collections</p>
          <h1 className="display text-[clamp(2.25rem,5vw,3.75rem)] uppercase tracking-[0.12em] text-ink">
            Womenswear
          </h1>
        </section>

        <ColorCollectionRails />
      </main>
      <Footer />
    </div>
  );
}
