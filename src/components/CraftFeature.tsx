import Link from "next/link";
import type { Craft } from "@/lib/data";
import MediaFrame, { toneForSlug } from "./MediaFrame";

type CraftFeatureProps = {
  craft: Craft;
  reverse?: boolean;
};

export default function CraftFeature({
  craft,
  reverse = false,
}: CraftFeatureProps) {
  return (
    <section className="section-pad py-14 md:py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2 md:gap-14 lg:gap-20">
        <div
          className={`relative aspect-[4/5] w-full ${
            reverse ? "md:order-2" : "md:order-1"
          }`}
        >
          <MediaFrame
            src={craft.image || ""}
            alt={craft.title}
            tone={toneForSlug(craft.slug)}
            label={craft.title}
            sizes="(max-width:768px) 100vw, 50vw"
          />
          <div className="absolute left-4 top-4 z-[2] max-w-[72%] text-white drop-shadow-sm md:left-5 md:top-5">
            <h3 className="display text-sm uppercase tracking-[0.16em] md:text-base">
              {craft.title}
            </h3>
            <span className="my-2.5 hairline bg-white" />
            <p className="text-xs leading-relaxed text-white/90 md:text-[0.8rem]">
              {craft.description}
            </p>
          </div>
        </div>

        <div
          className={`flex flex-col items-start ${
            reverse ? "md:order-1 md:items-end md:text-right" : "md:order-2"
          }`}
        >
          <p className="eyebrow">{craft.label}</p>
          <h2 className="display mt-3 max-w-md text-2xl uppercase tracking-[0.08em] text-ink md:text-[1.85rem] lg:text-[2.1rem]">
            {craft.title}
          </h2>
          <span
            className={`my-5 hairline bg-ink ${reverse ? "md:ml-auto" : ""}`}
          />
          <p
            className={`max-w-md text-[1.05rem] leading-relaxed text-ink-soft ${
              reverse ? "md:ml-auto" : ""
            }`}
          >
            {craft.description}
          </p>
          <Link
            href={`/crafts/${craft.slug}`}
            className={`ghost-btn ghost-btn-dark mt-8 text-ink ${
              reverse ? "md:ml-auto" : ""
            }`}
          >
            The Work
          </Link>
        </div>
      </div>
    </section>
  );
}
