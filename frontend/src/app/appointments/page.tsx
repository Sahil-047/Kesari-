import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import PageHero from "@/components/PageHero";

export default function AppointmentsPage() {
  return (
    <div className="site-shell">
      <Header />
      <main className="site-main relative parchment-surface parchment-noise">
        <PageHero eyebrow="The House" title="Appointments">
          <p>
            Bridal commissions and made-to-measure fittings are taken by
            appointment. The atelier writes before a commission is cut.
          </p>
        </PageHero>
        <section className="section-pad relative z-10 pb-24 text-center">
          <Link href="/atelier" className="ghost-btn ghost-btn-dark text-ink">
            Write to the House
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
