"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { gsap, useGSAP } from "@/components/motion/gsap-client";
import { classNames } from "@/lib/format";

type Overlay = "left" | "right" | "center";

type CinematicPanelProps = {
  title: string;
  kicker?: string;
  cta: string;
  href: string;
  image: string;
  position?: string;
  overlay?: Overlay;
  priority?: boolean;
  tight?: boolean;
};

export function CinematicPanel({
  title,
  kicker,
  cta,
  href,
  image,
  position = "center",
  overlay = "center",
  priority = false,
  tight = false,
}: CinematicPanelProps) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".panel-image",
          { scale: 1.16 },
          {
            scale: 1.08,
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );

        gsap.from(".panel-copy", {
          y: 36,
          autoAlpha: 0,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: root.current,
            start: "top 70%",
          },
        });
      });
    },
    { scope: root },
  );

  const align =
    overlay === "left"
      ? "items-start text-left"
      : overlay === "right"
        ? "items-end text-right"
        : "items-center text-center";

  return (
    <section ref={root} className="relative h-[100svh] min-h-[640px] overflow-hidden">
      <div className="panel-image absolute inset-0">
        <Image
          src={image}
          alt=""
          fill
          priority={priority}
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: position }}
        />
      </div>
      <div className="cinema-scrim absolute inset-0" />
      <div
        className={classNames(
          "panel-copy relative z-10 flex h-full flex-col justify-end px-6 pb-16 md:px-16 md:pb-20",
          align,
        )}
      >
        {kicker ? (
          <p className="nav-link mb-4 text-gold-light">{kicker}</p>
        ) : null}
        <h2
          className="display-title max-w-[18ch] text-[2.1rem] text-cream drop-shadow-[0_2px_18px_rgba(16,10,6,0.55)] sm:text-5xl md:text-6xl lg:text-7xl"
          style={tight ? { letterSpacing: "0.04em" } : undefined}
        >
          {title}
        </h2>
        <Link href={href} className="outline-btn mt-8 text-cream">
          {cta}
        </Link>
      </div>
    </section>
  );
}
