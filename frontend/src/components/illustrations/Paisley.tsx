"use client";

import DrawSvg, { DrawPath } from "./DrawSvg";

type Props = { draw?: boolean; className?: string; strokeWidth?: number };

export default function Paisley({
  draw = true,
  className = "",
  strokeWidth = 1.1,
}: Props) {
  return (
    <DrawSvg
      draw={draw}
      className={className}
      viewBox="0 0 80 100"
      stroke="currentColor"
      strokeWidth={strokeWidth}
    >
      <DrawPath d="M40 90 C18 78 12 48 28 28 C40 12 58 18 58 36 C58 52 46 58 40 70 C36 78 38 86 40 90 Z" />
      <DrawPath d="M40 70 C34 58 38 42 48 36" />
    </DrawSvg>
  );
}
