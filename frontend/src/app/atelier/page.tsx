import AtelierEnquiry from "@/components/atelier/AtelierEnquiry";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { getPageContent } from "@/lib/content/getPageContent";

export default async function AtelierPage() {
  const content = await getPageContent("atelier");

  return (
    <div className="site-shell default-surface parchment-noise">
      <Header />
      <main className="site-main relative z-10">
        <AtelierEnquiry intro={content.intro} />
      </main>
      <Footer />
    </div>
  );
}
