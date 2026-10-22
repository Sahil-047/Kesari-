import { EnquiryForm } from "@/components/atelier/enquiry-form";
import { GoldRule } from "@/components/paper/gold-rule";
import { PageIntro } from "@/components/editorial/page-intro";

export const metadata = {
  title: "The Atelier",
};

export default function AtelierPage() {
  return (
    <div className="inner-page">
      <PageIntro
        kicker="The atelier"
        title="By appointment"
        lede="Cloth is shown in daylight. Bridal commissions begin with a conversation, not a catalogue. Write to the house and a date will be found."
      />
      <section className="mx-auto grid max-w-[1100px] gap-16 px-6 pb-28 md:grid-cols-2 md:px-10">
        <div>
          <p className="nav-link text-gold">Visiting</p>
          <h2 className="mt-4 font-serif text-3xl text-ink">The room</h2>
          <GoldRule align="left" className="mt-5" />
          <p className="mt-6 font-serif text-xl leading-relaxed text-ink-soft">
            Pieces hang on wood, not chrome. You may ask to see a zardozi
            panel unfinished, if one is on the frame. Sizes in the shop are a
            starting point; most wedding cloth is cut after a fitting note.
          </p>
          <p className="mt-6 text-sm tracking-[0.16em] text-ink-soft uppercase">
            India · Enquiries in INR
          </p>
        </div>
        <EnquiryForm />
      </section>
    </div>
  );
}
