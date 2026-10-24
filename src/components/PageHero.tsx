type PageHeroProps = {
  eyebrow?: string;
  title: string;
  children?: React.ReactNode;
  compact?: boolean;
  /** Skip own surface when parent already provides the page background */
  bare?: boolean;
};

export default function PageHero({
  eyebrow,
  title,
  children,
  compact = false,
  bare = false,
}: PageHeroProps) {
  return (
    <section
      className={`section-pad text-center ${
        bare ? "" : "relative parchment-surface parchment-noise"
      } ${
        compact ? "pb-10 pt-8 md:pb-12 md:pt-10" : "pb-14 pt-12 md:pb-18 md:pt-16"
      }`}
    >
      <div className="relative z-10 mx-auto max-w-3xl">
        {eyebrow ? <p className="eyebrow mb-4">{eyebrow}</p> : null}
        <h1 className="display text-[clamp(2.25rem,5vw,3.75rem)] uppercase tracking-[0.12em] text-ink">
          {title}
        </h1>
        {children ? (
          <div className="mx-auto mt-6 max-w-2xl text-[1.05rem] leading-relaxed text-ink-soft md:text-lg">
            {children}
          </div>
        ) : null}
      </div>
    </section>
  );
}
