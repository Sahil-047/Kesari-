import Image from "next/image";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function AtelierPage() {
  return (
    <div className="site-shell bg-[#050505]">
      <Header variant="overlay" />
      <main className="site-main relative z-10">
        <section className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden px-6 pb-16 pt-28">
          <div className="relative z-10 mx-auto w-full max-w-xl text-center">
            <p className="font-sans text-[0.6rem] uppercase tracking-[0.35em] text-white/55">
              The House
            </p>
            <h1 className="display mt-4 text-[clamp(2rem,5vw,3.5rem)] uppercase tracking-[0.18em] text-white">
              The Atelier
            </h1>

            <div className="relative mx-auto mt-10 aspect-square w-full max-w-[min(88vw,28rem)]">
              <Image
                src="/images/atelier-peacock.png"
                alt="Kesari peacock emblem"
                fill
                priority
                quality={100}
                sizes="(max-width:768px) 88vw, 28rem"
                className="object-contain"
              />
            </div>

            <p className="mx-auto mt-10 max-w-md text-sm leading-relaxed text-white/70 md:text-base">
              Write to the house for fittings, commissions, and bridal
              appointments. The atelier replies with a note, never a catalogue
              blast.
            </p>
          </div>
        </section>

        <section className="section-pad relative z-10 mx-auto max-w-lg pb-24 pt-4">
          <form className="space-y-5">
            <label className="block">
              <span className="font-sans text-[0.58rem] uppercase tracking-[0.22em] text-gold-soft">
                Name
              </span>
              <input
                type="text"
                className="mt-2 w-full border border-white/20 bg-white/5 px-4 py-3 font-serif text-white outline-none transition placeholder:text-white/30 focus:border-gold/50"
              />
            </label>
            <label className="block">
              <span className="font-sans text-[0.58rem] uppercase tracking-[0.22em] text-gold-soft">
                Email
              </span>
              <input
                type="email"
                className="mt-2 w-full border border-white/20 bg-white/5 px-4 py-3 font-serif text-white outline-none transition placeholder:text-white/30 focus:border-gold/50"
              />
            </label>
            <label className="block">
              <span className="font-sans text-[0.58rem] uppercase tracking-[0.22em] text-gold-soft">
                Note
              </span>
              <textarea
                rows={5}
                className="mt-2 w-full resize-none border border-white/20 bg-white/5 px-4 py-3 font-serif text-white outline-none transition placeholder:text-white/30 focus:border-gold/50"
                placeholder="Commission, fitting, or bridal appointment…"
              />
            </label>
            <button
              type="button"
              className="w-full border border-gold/70 bg-transparent px-8 py-3.5 font-sans text-[0.65rem] uppercase tracking-[0.28em] text-gold transition hover:bg-gold/10"
            >
              Write to the House
            </button>
          </form>
        </section>
      </main>
      <Footer />
    </div>
  );
}
