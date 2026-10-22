import Image from "next/image";
import Link from "next/link";
import { classNames } from "@/lib/format";
import { house } from "@/lib/site";

type SiteLogoProps = {
  tone?: "cream" | "ink";
  compact?: boolean;
};

export function SiteLogo({ tone = "cream", compact = false }: SiteLogoProps) {
  const cream = tone === "cream";

  return (
    <Link
      href="/"
      className={classNames(
        "group flex flex-col items-center text-center",
        cream ? "text-cream" : "text-ink",
      )}
      aria-label={`${house.name}, ${house.designer}`}
    >
      <span
        className={classNames(
          "relative overflow-hidden rounded-full ring-1",
          compact ? "h-9 w-9" : "h-10 w-10 md:h-11 md:w-11",
          cream ? "ring-gold-light/50" : "ring-gold/40",
        )}
      >
        <Image
          src="/images/logo.png"
          alt=""
          fill
          sizes="48px"
          className="object-cover"
          priority
        />
      </span>
      <span
        className={classNames(
          "brand-mark mt-1 leading-none",
          compact ? "text-[0.9rem]" : "text-[1.05rem] md:text-[1.2rem]",
        )}
      >
        {house.name}
      </span>
      {!compact ? (
        <span
          className={classNames(
            "script-line mt-0 hidden text-[0.95rem] sm:block md:text-base",
            cream ? "text-gold-light" : "text-gold",
          )}
        >
          by {house.designer}
        </span>
      ) : null}
    </Link>
  );
}
