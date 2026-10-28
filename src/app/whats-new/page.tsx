import AutoLoopVideo from "@/components/AutoLoopVideo";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import WhatsNewExperience from "@/components/WhatsNewExperience";

export default function WhatsNewPage() {
  return (
    <div className="site-shell page-grain">
      <main className="site-main relative z-10">
        <section className="relative h-[68dvh] w-full overflow-hidden md:aspect-video md:h-auto md:min-h-[56dvh]">
          <Header variant="overlay" />
          <AutoLoopVideo
            className="absolute inset-0 h-full w-full object-cover"
            src="/videos/whats-new.mp4"
            poster="/images/whats-new-poster.jpg"
            aria-label="What's New"
          />
          <div className="absolute inset-0 z-[1] bg-gradient-to-t from-ink/65 via-ink/15 to-ink/20" />
          <div className="absolute inset-x-0 bottom-0 z-[2] section-pad pb-10 text-cream md:pb-14">
            <div className="mx-auto max-w-[1680px]">
              <p className="font-sans text-[0.6rem] uppercase tracking-[0.36em] text-cream/85">
                The Season
              </p>
              <h1 className="display mt-3 text-[clamp(2.4rem,8vw,5.25rem)] uppercase leading-[0.92] tracking-[0.1em]">
                What&apos;s New
              </h1>
            </div>
          </div>
        </section>

        <WhatsNewExperience />
      </main>
      <Footer />
    </div>
  );
}
