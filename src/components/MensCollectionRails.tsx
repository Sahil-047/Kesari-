import Image from "next/image";
import Link from "next/link";
import { MENS_COLLECTIONS, type RailImage } from "@/lib/mens-collections";

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

export default function MensCollectionRails() {
  return (
    <>
      {MENS_COLLECTIONS.map((col) => (
        <section key={col.title} className="relative z-10 pb-14 md:pb-20">
          <h2 className="display section-pad mb-6 text-[clamp(1.25rem,2.5vw,1.75rem)] uppercase tracking-[0.28em] text-ink">
            {col.title}
          </h2>
          <NaturalRail
            images={col.images}
            href={col.href}
            label={col.title}
          />
        </section>
      ))}
    </>
  );
}
