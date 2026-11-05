import { useId } from "react";

/** Static architectural linework; the lattice repeats without adding DOM tiles. */
export default function JharokhaWindow({ className = "" }: { className?: string }) {
  const id = useId();
  const openingId = `${id}-opening`;
  const latticeId = `${id}-lattice`;
  const clipId = `${id}-clip`;

  return (
    <svg
      viewBox="0 0 400 440"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <defs>
        <path
          id={openingId}
          d="M80 340V174C80 154 87 142 103 142C91 120 103 104 124 106C118 84 138 70 158 62C170 48 188 42 200 24C212 42 230 48 242 62C262 70 282 84 276 106C297 104 309 120 297 142C313 142 320 154 320 174V340Z"
        />
        <clipPath id={clipId}>
          <use href={`#${openingId}`} fill="white" stroke="none" />
        </clipPath>
        <pattern id={latticeId} width="28" height="28" patternUnits="userSpaceOnUse">
          <path d="M0 14L14 0L28 14L14 28Z" strokeWidth="0.8" />
          <circle cx="14" cy="14" r="2" strokeWidth="0.7" />
        </pattern>
      </defs>

      <rect
        x="78"
        y="22"
        width="244"
        height="320"
        fill={`url(#${latticeId})`}
        stroke="none"
        clipPath={`url(#${clipId})`}
        opacity="0.65"
      />
      <use href={`#${openingId}`} strokeWidth="2" />
      <path d="M60 350V174C60 108 113 66 158 42C176 32 190 19 200 8C210 19 224 32 242 42C287 66 340 108 340 174V350" />

      {/* Slender fluted columns, capitals, and stepped plinth. */}
      <path d="M44 190H76V202H44ZM48 202V330M60 202V330M72 202V330M42 330H78V340H42ZM324 190H356V202H324ZM328 202V330M340 202V330M352 202V330M322 330H358V340H322Z" />
      <path d="M32 350H368V362H32ZM44 362H356V376H44ZM58 376H342L330 390H70ZM100 390V404H300V390M88 410H312M116 420H284" />
      <path d="M80 350V362M120 350V362M160 350V362M200 350V362M240 350V362M280 350V362M320 350V362" />
      <path d="M104 376L116 390L128 376M176 376L188 390L200 376M248 376L260 390L272 376" />
    </svg>
  );
}
