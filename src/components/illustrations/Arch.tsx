"use client";

import DrawSvg, { DrawPath } from "./DrawSvg";

type Props = { draw?: boolean; className?: string; strokeWidth?: number };

export default function Arch({
  draw = true,
  className = "",
  strokeWidth = 1.15,
}: Props) {
  return (
    <DrawSvg
      draw={draw}
      className={className}
      viewBox="0 0 240 280"
      stroke="currentColor"
      strokeWidth={strokeWidth}
    >
      <DrawPath d="M40 260 V120 C40 48 90 20 120 20 C150 20 200 48 200 120 V260" />
      <DrawPath d="M56 260 V124 C56 64 96 36 120 36 C144 36 184 64 184 124 V260" />
      <DrawPath d="M120 20 V36" />
      <DrawPath d="M108 20 H132" />
      <DrawPath d="M40 260 H200" />
    </DrawSvg>
  );
}
