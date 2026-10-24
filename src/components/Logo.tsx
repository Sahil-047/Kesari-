import Link from "next/link";

type LogoProps = {
  tone?: "light" | "dark" | "gold";
  size?: "sm" | "md" | "lg";
  href?: string;
  showMark?: boolean;
};

const tones = {
  light: "text-white",
  dark: "text-ink",
  gold: "text-gold",
};

const sizes = {
  sm: { mark: 28, brand: "text-lg tracking-[0.35em]", script: "text-sm" },
  md: { mark: 36, brand: "text-xl tracking-[0.4em]", script: "text-base" },
  lg: { mark: 52, brand: "text-3xl tracking-[0.45em]", script: "text-xl" },
};

export function LogoMark({
  size = 36,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M22 18h8.5c7.2 0 12 3.8 12 10.2 0 4.4-2.4 7.5-6.2 9L44 46h-7.2l-7-8.2H29V46h-7V18zm7 13.2h1.6c3.2 0 5-1.5 5-4.1s-1.8-4.1-5-4.1H29v8.2z"
        fill="currentColor"
      />
    </svg>
  );
}

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
  showMark = true,
}: LogoProps) {
  const s = sizes[size];
  const content = (
    <span className={`inline-flex flex-col items-start ${tones[tone]}`}>
      {showMark ? <LogoMark size={s.mark} className="mb-1.5" /> : null}
      <span className={`display font-medium uppercase ${s.brand}`}>Kesari</span>
      <span className={`script mt-0.5 opacity-90 ${s.script}`}>
        by Bhumika Patel
      </span>
    </span>
  );

  if (!href) return content;
  return (
    <Link href={href} className="inline-flex" aria-label="Kesari home">
      {content}
    </Link>
  );
}
