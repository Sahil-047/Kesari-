import Image from "next/image";
import Link from "next/link";
import {
  COLOR_COLLECTIONS,
  type RailImage,
} from "@/lib/color-collections";

function NaturalRail({
  images,
  href,
  label,
}: {
  images: RailImage[];
  href?: string;
  label: string;
}) {
  return (
    <div className="rail-hide-scroll section-pad items-end">
      {images.map((img) => {
        const frame = (
          <Image
            src={img.src}
            alt=""
            width={img.width}
            height={img.height}
            quality={100}
            sizes="(max-width:768px) 55vw, 280px"
            className="h-[min(52vh,420px)] w-auto max-w-none shrink-0"
          />
        );

        if (!href) return <span key={img.src}>{frame}</span>;

        return (
          <Link
            key={img.src}
            href={href}
            aria-label={label}
            className="shrink-0"
          >
            {frame}
          </Link>
        );
      })}
    </div>
  );
}

function ColorRailSection({
  title,
  images,
  href,
}: {
  title: string;
  images: RailImage[];
  href?: string;
}) {
  return (
    <section className="relative z-10 pb-14 md:pb-20">
      <h2 className="display section-pad mb-6 text-[clamp(1.25rem,2.5vw,1.75rem)] uppercase tracking-[0.28em] text-ink">
        {title}
      </h2>
      <NaturalRail images={images} href={href} label={title} />
    </section>
  );
}

export default function ColorCollectionRails() {
  return (
    <>
      {COLOR_COLLECTIONS.map((col) => (
        <ColorRailSection
          key={col.title}
          title={col.title}
          images={col.images}
          href={col.href}
        />
      ))}
    </>
  );
}
