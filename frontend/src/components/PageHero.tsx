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
        <h1 className="display text-[clamp(1.75rem,7vw,3.75rem)] uppercase tracking-[0.1em] text-ink sm:tracking-[0.12em]">
          {title}
        </h1>
        {children ? (
          <div className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ink-soft sm:mt-6 sm:text-[1.05rem] md:text-lg">
            {children}
          </div>
        ) : null}
      </div>
    </section>
  );
}
