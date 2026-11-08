import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import LookbookProductDetail from "@/components/LookbookProductDetail";
import { getSiteContact } from "@/lib/content/getSiteContact";
import { getLookbookProduct, LOOKBOOK_PRODUCTS, lookbookPhotos } from "@/lib/lookbook";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return LOOKBOOK_PRODUCTS.map(({ id }) => ({ id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = getLookbookProduct(id);
  if (!product) return { title: "Product not found | Kesari" };
  return {
    title: `${product.name} | Kesari by Bhumika Patel`,
    description: product.description,
  };
}

async function ProductContent({ params }: Props) {
  const { id } = await params;
  const product = getLookbookProduct(id);
  if (!product) {
    // CMS products live at /product/<id>; a lookbook-style link to one still lands right.
    if (/^[a-f0-9]{24}$/i.test(id)) redirect(`/product/${id}`);
    notFound();
  }

  const contact = await getSiteContact();

  return (
    <LookbookProductDetail
      key={product.id}
      product={product}
      photos={lookbookPhotos(product)}
      initialContact={contact}
    />
  );
}

export default function LookbookProductPage({ params }: Props) {
  return (
    <div className="site-shell default-surface">
      <Header />
      <main className="site-main section-pad pb-20 pt-6 md:pb-28 md:pt-10">
        <Suspense fallback={<p className="py-20 text-center text-ink-soft" role="status">Opening the lookbook…</p>}>
          <ProductContent params={params} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
