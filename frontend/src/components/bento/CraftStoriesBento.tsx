import { CRAFTS } from "@/lib/data";
import { BentoHeading, BentoPhoto } from "./BentoTile";

/**
 * Tile spans for a 4-column grid, read in order: one large arch, a tall
 * column, two squares, then wides and squares so every row closes.
 */
const LAYOUT = [
  { span: "col-span-2 md:row-span-2 min-h-[420px]", shape: "arch" as const },
  { span: "col-span-2 md:col-span-1 md:row-span-2 min-h-[320px]", shape: "rect" as const },
  { span: "", shape: "rect" as const },
  { span: "", shape: "rect" as const },
  { span: "col-span-2", shape: "rect" as const },
  { span: "", shape: "rect" as const },
  { span: "", shape: "rect" as const },
  { span: "col-span-2", shape: "rect" as const },
  { span: "col-span-2", shape: "rect" as const },
];

/** The house's colour stories as a bento, each tile opening its craft page. */
export default function CraftStoriesBento() {
  const stories = CRAFTS.filter((c) => c.image).slice(0, LAYOUT.length);

  return (
    <section className="relative parchment-surface parchment-noise section-pad pb-24 pt-4 md:pb-32" aria-label="Stories of the house">
      <div className="relative z-10 mx-auto max-w-[1280px]">
        <BentoHeading eyebrow="The stories" title="Colour and Craft" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:auto-rows-[minmax(210px,auto)] md:gap-4">
          {stories.map((craft, i) => {
            const cell = LAYOUT[i]!;
            return (
              <BentoPhoto
                key={craft.slug}
                href={`/crafts/${craft.slug}`}
                image={craft.image}
                eyebrow={craft.label}
                title={craft.title}
                shape={cell.shape}
                className={cell.span}
                sizes={cell.span.includes("col-span-2") ? "(max-width:768px) 100vw, 50vw" : "(max-width:768px) 50vw, 25vw"}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
