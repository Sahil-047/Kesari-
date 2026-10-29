const DEVANAGARI_DIGITS = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"] as const;

/** Convert a non-negative integer to Devanagari (Sanskrit) numerals. */
export function toSanskritNumeral(n: number): string {
  const clamped = Math.max(0, Math.min(100, Math.round(n)));
  return String(clamped)
    .split("")
    .map((d) => DEVANAGARI_DIGITS[Number(d)] ?? d)
    .join("");
}
