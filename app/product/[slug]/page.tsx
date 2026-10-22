import Image from "next/image";
import { notFound } from "next/navigation";
import { GoldRule } from "@/components/paper/gold-rule";
import { AddToBag } from "@/components/shop/add-to-bag";
import { ProductGrid } from "@/components/shop/product-grid";
import {
  getCraft,
  getProduct,
  products,
  relatedProducts,
} from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import Link from "next/link";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProduct(slug);
  return { title: product?.name ?? "Piece" };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const craft = getCraft(product.craftSlug);
  const related = relatedProducts(product.slug);

  return (
    <div className="inner-page">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-6 py-10 md:grid-cols-2 md:px-10 md:py-16">
        <div className="relative min-h-[560px] overflow-hidden bg-ink/10 md:min-h-[760px]">
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
            style={{ objectPosition: product.position }}
          />
        </div>

        <div className="flex flex-col justify-center md:py-8">
          <p className="nav-link text-gold">{product.kicker}</p>
          <h1 className="display-title mt-4 text-4xl text-ink md:text-5xl">
            {product.name}
          </h1>
          <GoldRule align="left" className="mt-6" />
          <p className="mt-6 text-lg tracking-[0.18em] text-ink">
            {formatPrice(product.price)}
          </p>
          {craft ? (
            <Link
              href={`/crafts/${craft.slug}`}
              className="mt-3 text-sm tracking-wide text-ink-soft underline decoration-gold/50"
            >
              {craft.name}
            </Link>
          ) : null}
          <p className="mt-8 max-w-lg font-serif text-xl leading-relaxed text-ink-soft">
            {product.description}
          </p>
          <ul className="mt-8 space-y-2 text-sm tracking-wide text-ink-soft">
            {product.details.map((detail) => (
              <li key={detail} className="border-l border-gold/50 pl-4">
                {detail}
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <AddToBag product={product} />
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-[1400px] px-6 pb-24 md:px-10">
        <div className="mb-10 text-center">
          <p className="nav-link text-gold">Also from the house</p>
          <GoldRule className="mt-5" />
        </div>
        <ProductGrid products={related} />
      </section>
    </div>
  );
}
