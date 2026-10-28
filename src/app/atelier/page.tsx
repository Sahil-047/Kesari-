import Image from "next/image";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function AtelierPage() {
  return (
    <div className="site-shell bg-[#050505]">
      <Header variant="overlay" />
      <main className="site-main relative z-10">
        <section className="relative px-6 pb-20 pt-28 md:px-10 md:pb-24 md:pt-32 lg:px-14">
          <div className="mx-auto grid w-full max-w-[1080px] grid-cols-1 items-stretch gap-12 md:grid-cols-2 md:gap-x-14 lg:gap-x-20">
            {/* Column 1 — brand (matches enquiry column height) */}
            <div className="flex min-h-0 flex-col">
              <p className="font-sans text-[0.6rem] uppercase tracking-[0.35em] text-white/50">
                The House
              </p>
              <h1 className="display mt-3 text-[clamp(1.9rem,3.8vw,3rem)] uppercase tracking-[0.18em] text-white">
                The Atelier
              </h1>

              <div className="relative mt-8 w-[calc(100%+1.25rem)] flex-1 min-h-[18rem] -translate-x-3 sm:w-[calc(100%+1.75rem)] sm:-translate-x-5 md:min-h-[22rem] md:w-[calc(100%+2.5rem)] md:-translate-x-8 lg:-translate-x-10">
                <Image
                  src="/images/atelier-peacock.png"
                  alt="Kesari peacock emblem"
                  fill
                  priority
                  quality={100}
                  sizes="(max-width:768px) 95vw, 48vw"
                  className="object-contain object-left object-center"
                />
              </div>

              <p className="mt-8 max-w-[22rem] text-[0.98rem] leading-relaxed text-white/65">
                Write to the house for fittings, commissions, and bridal
                appointments. The atelier replies with a note, never a catalogue
                blast.
              </p>
            </div>

            {/* Column 2 — form */}
            <div className="flex min-h-0 flex-col">
              <p className="min-h-[1.15rem] text-center font-sans text-[0.72rem] uppercase leading-none tracking-[0.3em] text-gold-soft md:text-[0.78rem]">
                Enquiry
              </p>

              <form className="mt-8 flex flex-1 flex-col justify-between gap-7">
                <div className="flex flex-col gap-7">
                  <label className="block">
                    <span className="font-sans text-[0.58rem] uppercase tracking-[0.22em] text-white/55">
                      Name
                    </span>
                    <input
                      type="text"
                      name="name"
                      autoComplete="name"
                      className="mt-2.5 w-full border-0 border-b border-white/25 bg-transparent px-0 py-3 font-serif text-[1.02rem] text-white outline-none transition placeholder:text-white/25 focus:border-gold/60"
                    />
                  </label>

                  <label className="block">
                    <span className="font-sans text-[0.58rem] uppercase tracking-[0.22em] text-white/55">
                      Email
                    </span>
                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      className="mt-2.5 w-full border-0 border-b border-white/25 bg-transparent px-0 py-3 font-serif text-[1.02rem] text-white outline-none transition placeholder:text-white/25 focus:border-gold/60"
                    />
                  </label>

                  <label className="block">
                    <span className="font-sans text-[0.58rem] uppercase tracking-[0.22em] text-white/55">
                      Note
                    </span>
                    <textarea
                      name="note"
                      rows={5}
                      placeholder="Commission, fitting, or bridal appointment…"
                      className="mt-2.5 w-full resize-none border-0 border-b border-white/25 bg-transparent px-0 py-3 font-serif text-[1.02rem] text-white outline-none transition placeholder:text-white/25 focus:border-gold/60"
                    />
                  </label>
                </div>

                <button
                  type="button"
                  className="solid-btn w-full cursor-pointer bg-cream text-ink hover:bg-parchment-light"
                >
                  Write to the House
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
