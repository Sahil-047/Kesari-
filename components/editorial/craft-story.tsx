"use client";

import { useRef } from "react";
import { GoldRule } from "@/components/paper/gold-rule";
import { ProductGrid } from "@/components/shop/product-grid";
import { gsap, useGSAP } from "@/components/motion/gsap-client";
import type { Product } from "@/lib/catalog";

type CraftStoryProps = {
  title: string;
  statement: string;
  products: Product[];
};

function splitWords(text: string) {
  return text.split(/(\s+)/).map((part, index) => {
    if (/^\s+$/.test(part)) {
      return part;
    }

    return (
      <span key={`${part}-${index}`} className="inline-block overflow-hidden align-bottom">
        <span className="type-word inline-block will-change-transform">{part}</span>
      </span>
    );
  });
}

function splitChars(text: string) {
  return text.split("").map((char, index) => {
    if (char === " ") {
      return (
        <span key={`space-${index}`} className="inline-block w-[0.35em]">
          {" "}
        </span>
      );
    }

    return (
      <span key={`${char}-${index}`} className="inline-block overflow-hidden align-bottom">
        <span className="type-char inline-block will-change-transform">{char}</span>
      </span>
    );
  });
}

export function CraftStory({ title, statement, products }: CraftStoryProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const intro = root.current?.querySelector(".craft-intro");
        const related = root.current?.querySelector(".craft-related");

        if (intro) {
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: intro,
              start: "top 78%",
            },
          });

          tl.from(".intro-kicker", {
            y: 18,
            autoAlpha: 0,
            duration: 0.7,
            ease: "power3.out",
          })
            .from(
              ".type-char",
              {
                yPercent: 110,
                duration: 0.85,
                ease: "power3.out",
                stagger: 0.028,
              },
              "-=0.35",
            )
            .from(
              ".intro-rule",
              {
                scaleX: 0,
                transformOrigin: "center",
                duration: 0.7,
                ease: "power2.out",
              },
              "-=0.45",
            )
            .from(
              ".type-word",
              {
                yPercent: 100,
                autoAlpha: 0,
                duration: 0.75,
                ease: "power3.out",
                stagger: 0.018,
              },
              "-=0.35",
            );
        }

        if (related) {
          gsap
            .timeline({
              scrollTrigger: {
                trigger: related,
                start: "top 82%",
              },
            })
            .from(".related-kicker", {
              y: 16,
              autoAlpha: 0,
              duration: 0.65,
              ease: "power3.out",
            })
            .from(
              ".related-rule",
              {
                scaleX: 0,
                transformOrigin: "center",
                duration: 0.65,
                ease: "power2.out",
              },
              "-=0.35",
            )
            .from(
              ".related-grid .grid > *",
              {
                y: 36,
                autoAlpha: 0,
                duration: 0.9,
                ease: "power3.out",
                stagger: 0.1,
              },
              "-=0.25",
            );
        }
      });
    },
    { scope: root, dependencies: [title, statement] },
  );

  return (
    <div ref={root}>
      <header className="craft-intro mx-auto max-w-3xl px-6 pt-10 pb-12 text-center md:pt-16 md:pb-16">
        <p className="intro-kicker nav-link text-gold">The technique</p>
        <h1 className="olgans-title mt-5 text-4xl text-ink md:text-6xl">
          {splitChars(title)}
        </h1>
        <div className="intro-rule mt-6 flex justify-center">
          <GoldRule />
        </div>
        <p className="olgans-body mt-8 text-xl leading-snug tracking-tight text-ink-soft md:text-2xl md:leading-snug">
          {splitWords(statement)}
        </p>
      </header>

      {products.length ? (
        <section className="craft-related mx-auto max-w-[1400px] px-6 pb-24 md:px-10">
          <div className="mb-10 flex flex-col items-center">
            <p className="related-kicker nav-link text-gold">From this work</p>
            <div className="related-rule mt-5">
              <GoldRule />
            </div>
          </div>
          <div className="related-grid">
            <ProductGrid products={products} />
          </div>
        </section>
      ) : null}
    </div>
  );
}
