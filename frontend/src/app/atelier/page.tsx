import AtelierEnquiry from "@/components/atelier/AtelierEnquiry";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function AtelierPage() {
  return (
    <div className="site-shell bg-[#0b0907]">
      <Header variant="overlay" />
      <main className="site-main relative z-10">
        <AtelierEnquiry />
      </main>
      <Footer />
    </div>
  );
}
