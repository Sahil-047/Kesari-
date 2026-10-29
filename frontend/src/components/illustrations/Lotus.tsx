"use client";

import DrawSvg, { DrawPath } from "./DrawSvg";

type Props = { draw?: boolean; className?: string; strokeWidth?: number };

export default function Lotus({
  draw = true,
  className = "",
  strokeWidth = 1.1,
}: Props) {
  return (
    <DrawSvg
      draw={draw}
      className={className}
      viewBox="0 0 100 70"
      stroke="currentColor"
      strokeWidth={strokeWidth}
    >
      <DrawPath d="M50 58 C42 42 44 22 50 12 C56 22 58 42 50 58 Z" />
      <DrawPath d="M50 58 C30 52 18 38 22 24 C34 30 44 42 50 58 Z" />
      <DrawPath d="M50 58 C70 52 82 38 78 24 C66 30 56 42 50 58 Z" />
      <DrawPath d="M20 58 H80" />
    </DrawSvg>
  );
}
