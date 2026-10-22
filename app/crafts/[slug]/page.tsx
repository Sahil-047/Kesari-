import Image from "next/image";
import { notFound } from "next/navigation";
import { CraftStory } from "@/components/editorial/craft-story";
import { crafts, getCraft, productsByCraft } from "@/lib/catalog";

type CraftPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return crafts.map((craft) => ({ slug: craft.slug }));
}

export async function generateMetadata({ params }: CraftPageProps) {
  const { slug } = await params;
  const craft = getCraft(slug);
  return { title: craft?.name ?? "Craft" };
}

export default async function CraftDetailPage({ params }: CraftPageProps) {
  const { slug } = await params;
  const craft = getCraft(slug);
  if (!craft) notFound();

  const related = productsByCraft(craft.slug);

  return (
    <div>
      <div className="relative h-[70svh] min-h-[480px] overflow-hidden">
        <Image
          src={craft.image}
          alt={craft.name}
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: craft.position }}
        />
        <div className="cinema-scrim absolute inset-0" />
        {craft.kicker ? (
          <div className="relative z-10 flex h-full flex-col items-center justify-end px-6 pb-14 text-center">
            <p className="nav-link text-gold-light">{craft.kicker}</p>
            <h1 className="display-title mt-4 max-w-[16ch] text-4xl text-cream md:text-6xl">
              {craft.name}
            </h1>
          </div>
        ) : (
          <h1 className="sr-only">{craft.name}</h1>
        )}
      </div>

      <CraftStory
        title={craft.name}
        statement={craft.statement}
        products={related}
      />
    </div>
  );
}
