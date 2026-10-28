"use client";

import { useReducedMotion } from "framer-motion";
import { useState } from "react";
import type { WomensCategory } from "@/lib/color-collections";
import WomenswearCategories from "./WomenswearCategories";
import WomenswearChapters from "./WomenswearChapters";

export default function WomenswearBrowse() {
  const [category, setCategory] = useState<WomensCategory | "all">("all");
  const reduce = useReducedMotion();

  const onChange = (next: WomensCategory | "all") => {
    setCategory(next);
    if (typeof window === "undefined") return;
    window.requestAnimationFrame(() => {
      document.getElementById("womenswear-looks")?.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
        block: "start",
      });
    });
  };

  return (
    <>
      <WomenswearCategories active={category} onChange={onChange} />
      <WomenswearChapters category={category} />
    </>
  );
}
