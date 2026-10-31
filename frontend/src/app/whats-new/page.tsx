import Footer from "@/components/Footer";
import Header from "@/components/Header";
import WhatsNewExperience from "@/components/WhatsNewExperience";
import { getPageContent } from "@/lib/content/getPageContent";

export default async function WhatsNewPage() {
  const content = await getPageContent("whats-new");

  return (
    <div className="site-shell page-grain">
      <main className="site-main relative z-10">
        <WhatsNewExperience header={<Header variant="overlay" />} content={content} />
      </main>
      <Footer />
    </div>
  );
}
