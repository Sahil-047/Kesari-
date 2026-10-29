"use client";

import DrawSvg, { DrawPath } from "./DrawSvg";

type Props = { draw?: boolean; className?: string; strokeWidth?: number };

export default function MehendiVine({
  draw = true,
  className = "",
  strokeWidth = 1.1,
}: Props) {
  return (
    <DrawSvg
      draw={draw}
      className={className}
      viewBox="0 0 520 120"
      stroke="currentColor"
      strokeWidth={strokeWidth}
    >
      <DrawPath d="M20 70 C80 20 140 110 200 55 C250 15 300 100 360 50 C410 15 460 80 500 45" />
      <DrawPath d="M90 48 C100 30 118 32 122 48" />
      <DrawPath d="M230 48 C242 28 262 30 268 50" />
      <DrawPath d="M370 42 C382 22 402 24 408 44" />
      <DrawPath d="M150 78 C158 92 172 90 176 76" />
      <DrawPath d="M310 68 C318 84 334 82 338 66" />
    </DrawSvg>
  );
}
