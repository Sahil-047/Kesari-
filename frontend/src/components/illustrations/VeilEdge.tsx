"use client";

import DrawSvg, { DrawPath } from "./DrawSvg";

type Props = { draw?: boolean; className?: string; strokeWidth?: number };

export default function VeilEdge({
  draw = true,
  className = "",
  strokeWidth = 1.1,
}: Props) {
  return (
    <DrawSvg
      draw={draw}
      className={className}
      viewBox="0 0 400 40"
      stroke="currentColor"
      strokeWidth={strokeWidth}
    >
      <DrawPath d="M0 8 Q25 28 50 8 Q75 28 100 8 Q125 28 150 8 Q175 28 200 8 Q225 28 250 8 Q275 28 300 8 Q325 28 350 8 Q375 28 400 8" />
    </DrawSvg>
  );
}
