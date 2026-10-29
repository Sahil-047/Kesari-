import Image from "next/image";

type Tone = "dark" | "ember" | "forest" | "violet" | "ivory" | "wine" | "saffron";

const TONES: Record<Tone, string> = {
  dark: "from-[#1a1814] via-[#2c241c] to-[#3d3228]",
  ember: "from-[#5c2a18] via-[#8a3d1f] to-[#c45a2a]",
  forest: "from-[#0f1a14] via-[#1a3328] to-[#2d4a38]",
  violet: "from-[#2a1535] via-[#4a2460] to-[#6b3a88]",
  ivory: "from-[#d4c4a8] via-[#e8dcc8] to-[#cbb89a]",
  wine: "from-[#3a1218] via-[#5c1e28] to-[#7a2835]",
  saffron: "from-[#b85a1a] via-[#d4782a] to-[#e8a040]",
};

type MediaFrameProps = {
  src?: string | null;
  alt: string;
  tone?: Tone;
  label?: string;
  priority?: boolean;
  className?: string;
  sizes?: string;
  quality?: number;
  unoptimized?: boolean;
  /** CSS object-position; keep stable so crop does not jump. */
  objectPosition?: string;
};

/**
 * Fills its positioned parent (`relative` + sized).
 * Pass real `src` later — empty/null shows a tonal placeholder.
 */
export default function MediaFrame({
  src,
  alt,
  tone = "dark",
  label,
  priority = false,
  className = "",
  sizes = "100vw",
  quality = 95,
  unoptimized = false,
  objectPosition = "center",
}: MediaFrameProps) {
  const hasImage = Boolean(src);

  return (
    <div className={`absolute inset-0 overflow-hidden bg-ink ${className}`}>
      {hasImage ? (
        <Image
          src={src!}
          alt={alt}
          fill
          priority={priority}
          quality={quality}
          unoptimized={unoptimized}
          className="object-cover"
          style={{ objectPosition }}
          sizes={sizes}
        />
      ) : (
        <div
          className={`absolute inset-0 bg-gradient-to-br ${TONES[tone]}`}
          aria-hidden
        >
          <div
            className="absolute inset-0 opacity-[0.14]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 28% 38%, rgba(255,255,255,0.3), transparent 42%), radial-gradient(circle at 72% 68%, rgba(0,0,0,0.28), transparent 45%)",
            }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
            <span className="font-sans text-[0.55rem] uppercase tracking-[0.35em] text-white/40">
              Image placeholder
            </span>
            <span className="display max-w-[85%] text-sm uppercase tracking-[0.16em] text-white/50 md:text-base">
              {label ?? alt}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export function toneForSlug(slug: string): Tone {
  const s = slug.toLowerCase();
  if (s.includes("forest") || s.includes("ari")) return "forest";
  if (s.includes("cutdana") || s.includes("brocade") || s.includes("violet"))
    return "violet";
  if (
    s.includes("mirror") ||
    s.includes("resham") ||
    s.includes("saffron") ||
    s.includes("silk")
  )
    return "saffron";
  if (s.includes("zardozi") || s.includes("elephant") || s.includes("wine"))
    return "wine";
  if (s.includes("pitta") || s.includes("ivory") || s.includes("print"))
    return "ivory";
  if (s.includes("hand") || s.includes("ember")) return "ember";
  return "dark";
}
