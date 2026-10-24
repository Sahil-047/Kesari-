import AutoLoopVideo from "@/components/AutoLoopVideo";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import MensCollectionRails from "@/components/MensCollectionRails";

export default function MenswearPage() {
  return (
    <div className="site-shell page-grain">
      <main className="site-main relative z-10">
        <section className="relative aspect-video w-full overflow-hidden md:min-h-[56dvh]">
          <Header variant="overlay" />
          <AutoLoopVideo
            className="absolute inset-0 h-full w-full object-cover"
            src="/videos/menswear.mp4"
            poster="/images/menswear-poster.jpg"
            aria-label="Menswear"
          />
          <div className="absolute inset-0 z-[1] bg-black/20" />
        </section>

        <section className="section-pad relative z-10 pb-10 pt-12 text-center md:pb-12 md:pt-16">
          <p className="eyebrow mb-4">Heritage Menswear</p>
          <h1 className="display text-[clamp(2.25rem,5vw,3.75rem)] uppercase tracking-[0.12em] text-ink">
            Menswear
          </h1>
        </section>

        <MensCollectionRails />
      </main>
      <Footer />
    </div>
  );
}
