"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/components/motion/gsap-client";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
};

export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(root.current, {
          y: 28,
          autoAlpha: 0,
          duration: 1.05,
          delay,
          ease: "power3.out",
        });
      });
    },
    { scope: root, dependencies: [delay] },
  );

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}
