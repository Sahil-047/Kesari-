import Image from "next/image";
import Link from "next/link";
import logoDark from "../../public/images/kesari-logo.png";
import logoLight from "../../public/images/kesari-logo-light.png";

type LogoProps = {
  /** "light" and "gold" are for dark backgrounds. */
  tone?: "light" | "dark" | "gold";
  size?: "sm" | "md" | "lg";
  href?: string;
};

const sizes = {
  sm: "w-[120px] md:w-[156px]",
  md: "w-[180px]",
  lg: "w-[220px] md:w-[260px]",
};

const tones = {
  light: "drop-shadow-[0_1px_8px_rgba(0,0,0,0.45)]",
  dark: "",
  gold: "",
};

export function JaaliMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M20 120V55c0-28 18-45 40-45s40 17 40 45v65"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path d="M12 120h96M16 126h88" stroke="currentColor" strokeWidth="1.2" />
      {Array.from({ length: 5 }).map((_, row) =>
        Array.from({ length: 4 }).map((_, col) => (
          <circle
            key={`${row}-${col}`}
            cx={36 + col * 16}
            cy={42 + row * 16}
            r="3.2"
            stroke="currentColor"
            strokeWidth="1"
          />
        )),
      )}
    </svg>
  );
}

export default function Logo({
  tone = "dark",
  size = "md",
  href = "/",
}: LogoProps) {
  const content = (
    <Image
      src={tone === "dark" ? logoDark : logoLight}
      alt="Kesari by Bhumika Patel"
      className={`h-auto ${sizes[size]} ${tones[tone]}`}
      sizes="260px"
      priority
    />
  );

  if (!href) return content;
  return (
    <Link href={href} className="inline-flex" aria-label="Kesari home">
      {content}
    </Link>
  );
}
