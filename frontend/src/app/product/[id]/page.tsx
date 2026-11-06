import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ProductDetail from "@/components/ProductDetail";
import { getLiveProduct, getLiveProducts } from "@/lib/api/storefront";
import { getProduct, PRODUCTS, type Product } from "@/lib/data";

type Props = { params: Promise<{ id: string }> };

/**
 * /product/<id>: the product page for a CMS product, looked up by its API id.
 * - Lookbook ids (KES-001) belong to /product_detail and are sent there.
 * - A slug still resolves (API first, then the static pieces) so older links keep working.
 */
async function resolve(key: string): Promise<{ product: Product; related: Product[] } | null> {
  const live = await getLiveProduct(key);
  if (live) {
    const others = (await getLiveProducts()).filter((p) => p.id !== live.id);
    return { product: live, related: others.slice(0, 3) };
  }
  const product = getProduct(key);
  if (!product) return null;
  return { product, related: PRODUCTS.filter((p) => p.slug !== product.slug).slice(0, 3) };
}

export function generateStaticParams() {
  // Static pieces prerender at build; CMS products render on first visit, then stay cached.
  return PRODUCTS.map((p) => ({ id: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const found = await resolve(id);
  if (!found) return { title: "Product not found | Kesari" };
  return {
    title: `${found.product.name} | Kesari by Bhumika Patel`,
    description: found.product.description || undefined,
  };
}

export default function ProductPage({ params }: Props) {
  return (
    <Suspense fallback={<ProductFallback />}>
      <ProductContent params={params} />
    </Suspense>
  );
}

function ProductFallback() {
  return null;
}

async function ProductContent({ params }: Props) {
  const { id } = await params;
  if (/^KES-\d+/i.test(id)) redirect(`/product_detail/${id.toUpperCase()}`);

  const found = await resolve(id);
  if (!found) notFound();

  return (
    <div className="site-shell">
      <Header />
      <ProductDetail product={found.product} related={found.related} />
      <Footer />
    </div>
  );
}
