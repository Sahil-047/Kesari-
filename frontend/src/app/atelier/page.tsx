import AtelierEnquiry from "@/components/atelier/AtelierEnquiry";
import Header from "@/components/Header";
import { getPageContent } from "@/lib/content/getPageContent";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPageContent("atelier");
  return {
    title: `${content.intro.title || "Contact Us"} | Kesari`,
    description:
      content.intro.text ||
      "Write to Kesari for fittings, commissions, and bridal appointments.",
  };
}

export default async function AtelierPage() {
  const content = await getPageContent("atelier");

  return (
    <div className="site-shell default-surface parchment-noise">
      <Header />
      <main className="site-main relative z-10">
        <AtelierEnquiry intro={content.intro} />
      </main>
    </div>
  );
}
