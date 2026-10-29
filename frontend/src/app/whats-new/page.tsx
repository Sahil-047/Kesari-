import Footer from "@/components/Footer";
import Header from "@/components/Header";
import WhatsNewExperience from "@/components/WhatsNewExperience";

export default function WhatsNewPage() {
  return (
    <div className="site-shell page-grain">
      <main className="site-main relative z-10">
        <WhatsNewExperience header={<Header variant="overlay" />} />
      </main>
      <Footer />
    </div>
  );
}
