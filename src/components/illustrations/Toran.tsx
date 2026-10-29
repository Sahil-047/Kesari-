"use client";

import DrawSvg, { DrawPath } from "./DrawSvg";

type Props = { draw?: boolean; className?: string; strokeWidth?: number };

export default function Toran({
  draw = true,
  className = "",
  strokeWidth = 1.1,
}: Props) {
  return (
    <DrawSvg
      draw={draw}
      className={className}
      viewBox="0 0 400 80"
      stroke="currentColor"
      strokeWidth={strokeWidth}
    >
      <DrawPath d="M20 18 H380" />
      <DrawPath d="M60 18 Q70 48 80 18" />
      <DrawPath d="M110 18 Q120 52 130 18" />
      <DrawPath d="M160 18 Q170 46 180 18" />
      <DrawPath d="M210 18 Q220 54 230 18" />
      <DrawPath d="M260 18 Q270 48 280 18" />
      <DrawPath d="M310 18 Q320 50 330 18" />
      <DrawPath d="M80 34 Q85 58 90 34" />
      <DrawPath d="M170 32 Q175 56 180 32" />
      <DrawPath d="M270 34 Q275 58 280 34" />
    </DrawSvg>
  );
}
