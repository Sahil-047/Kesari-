"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import type { WomensCategory } from "@/lib/color-collections";
import WomenswearCategories from "./WomenswearCategories";
import WomenswearChapters from "./WomenswearChapters";

function scrollToLooks(smooth: boolean) {
  document.getElementById("womenswear-looks")?.scrollIntoView({
    behavior: smooth ? "smooth" : "auto",
    block: "start",
  });
}

export default function WomenswearBrowse({
  initialCategory,
}: {
  initialCategory?: WomensCategory;
}) {
  const [category, setCategory] = useState<WomensCategory | "all">(
    initialCategory ?? "all",
  );
  const reduce = useReducedMotion();

  // Arriving from a link like /womenswear?category=saree lands on the looks.
  useEffect(() => {
    if (!initialCategory) return;
    const id = window.requestAnimationFrame(() => scrollToLooks(false));
    return () => window.cancelAnimationFrame(id);
  }, [initialCategory]);

  const onChange = (next: WomensCategory | "all") => {
    setCategory(next);
    if (typeof window === "undefined") return;
    window.requestAnimationFrame(() => scrollToLooks(!reduce));
  };

  return (
    <>
      <WomenswearCategories active={category} onChange={onChange} />
      <WomenswearChapters category={category} />
    </>
  );
}
