"use client";

import DrawSvg, { DrawPath } from "./DrawSvg";

type Props = { draw?: boolean; className?: string; strokeWidth?: number };

export default function Doors({
  draw = true,
  className = "",
  strokeWidth = 1.15,
}: Props) {
  return (
    <DrawSvg
      draw={draw}
      className={className}
      viewBox="0 0 320 360"
      stroke="currentColor"
      strokeWidth={strokeWidth}
    >
      {/* Left leaf */}
      <DrawPath d="M20 340 V40 H150 V340 Z" />
      <DrawPath d="M40 60 H130 V160 H40 Z" />
      <DrawPath d="M40 180 H130 V300 H40 Z" />
      <DrawPath d="M135 190 A6 6 0 1 1 135 190.1" />
      {/* Right leaf */}
      <DrawPath d="M170 340 V40 H300 V340 Z" />
      <DrawPath d="M190 60 H280 V160 H190 Z" />
      <DrawPath d="M190 180 H280 V300 H190 Z" />
      <DrawPath d="M185 190 A6 6 0 1 1 185 190.1" />
      {/* Brass studs */}
      {[70, 100, 220, 250].map((x) =>
        [90, 120, 210, 240, 270].map((y) => (
          <DrawPath
            key={`${x}-${y}`}
            d={`M${x} ${y} a1.4 1.4 0 1 0 0.01 0`}
          />
        )),
      )}
    </DrawSvg>
  );
}
