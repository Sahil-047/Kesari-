import { GoldRule } from "@/components/paper/gold-rule";
import { classNames } from "@/lib/format";

type PageIntroProps = {
  kicker: string;
  title?: string;
  lede: string;
  font?: "default" | "olgans";
};

export function PageIntro({
  kicker,
  title,
  lede,
  font = "default",
}: PageIntroProps) {
  const olgans = font === "olgans";

  return (
    <header className="mx-auto max-w-3xl px-6 pt-10 pb-12 text-center md:pt-16 md:pb-16">
      <p
        className={classNames(
          olgans ? "olgans-body text-sm tracking-[0.22em] uppercase text-gold" : "nav-link text-gold",
        )}
      >
        {kicker}
      </p>
      {title ? (
        <h1
          className={classNames(
            "mt-5 text-4xl text-ink md:text-6xl",
            olgans ? "olgans-title" : "display-title",
          )}
        >
          {title}
        </h1>
      ) : null}
      <GoldRule className="mt-6" />
      <p
        className={classNames(
          "mt-8 text-xl leading-relaxed text-ink-soft md:text-2xl",
          olgans ? "olgans-body leading-snug tracking-tight md:leading-snug" : "font-serif",
        )}
      >
        {lede}
      </p>
    </header>
  );
}
