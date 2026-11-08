import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import LookbookProductDetail from "@/components/LookbookProductDetail";
import { getLiveProduct } from "@/lib/api/storefront";
import { getSiteContact } from "@/lib/content/getSiteContact";
import { getProduct, PRODUCTS, type Product } from "@/lib/data";
import { enquiryPhotos, productToEnquiryView } from "@/lib/lookbook";

type Props = { params: Promise<{ id: string }> };

/**
 * /product/<id>: CMS (and legacy static) pieces, same layout as the lookbook
 * product page. Lookbook ids (KES-001) belong on /product_detail.
 */
async function resolve(key: string): Promise<Product | null> {
  const live = await getLiveProduct(key);
  if (live) return live;
  return getProduct(key) ?? null;
}

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await resolve(id);
  if (!product) return { title: "Product not found | Kesari" };
  return {
    title: `${product.name} | Kesari by Bhumika Patel`,
    description: product.description || undefined,
  };
}

export default function ProductPage({ params }: Props) {
  return (
    <div className="site-shell default-surface">
      <Header />
      <main className="site-main section-pad pb-20 pt-6 md:pb-28 md:pt-10">
        <Suspense fallback={<p className="py-20 text-center text-ink-soft" role="status">Opening the piece…</p>}>
          <ProductContent params={params} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

async function ProductContent({ params }: Props) {
  const { id } = await params;
  if (/^KES-\d+/i.test(id)) redirect(`/product_detail/${id.toUpperCase()}`);

  const [product, contact] = await Promise.all([resolve(id), getSiteContact()]);
  if (!product) notFound();

  return (
    <LookbookProductDetail
      key={product.id ?? product.slug}
      product={productToEnquiryView(product)}
      photos={enquiryPhotos(product)}
      initialContact={contact}
    />
  );
}
