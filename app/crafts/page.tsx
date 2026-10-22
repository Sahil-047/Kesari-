import { CraftSpread } from "@/components/editorial/craft-spread";
import { PageIntro } from "@/components/editorial/page-intro";
import { crafts } from "@/lib/catalog";

export const metadata = {
  title: "Crafts",
};

export default function CraftsPage() {
  return (
    <div className="inner-page">
      <PageIntro
        kicker="The work"
        title="Crafts"
        lede="Resham, zardozi, ari, cutdana, pitta tiki, brocade and the hand print. None of it is a decoration laid on afterwards. It is how the garment is made."
      />
      <div className="mx-auto max-w-[1400px] space-y-8 px-6 pb-24 md:px-10">
        {crafts.map((craft, index) => (
          <CraftSpread key={craft.slug} craft={craft} index={index} />
        ))}
      </div>
    </div>
  );
}
