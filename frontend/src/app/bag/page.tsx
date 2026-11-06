import { Suspense } from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import BagClient from "@/components/BagClient";
import { getSiteContact } from "@/lib/content/getSiteContact";

async function BagWithContact() {
  const contact = await getSiteContact();
  return <BagClient initialContact={contact} />;
}

export default function BagPage() {
  return (
    <div className="site-shell">
      <Header />
      <Suspense fallback={<BagClient />}>
        <BagWithContact />
      </Suspense>
      <Footer />
    </div>
  );
}
