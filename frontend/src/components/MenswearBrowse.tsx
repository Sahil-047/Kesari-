"use client";

import { useReducedMotion } from "framer-motion";
import { useState } from "react";
import type { MensCategory } from "@/lib/mens-collections";
import MenswearCategories from "./MenswearCategories";
import MenswearChapters from "./MenswearChapters";

export default function MenswearBrowse() {
  const [category, setCategory] = useState<MensCategory | "all">("all");
  const reduce = useReducedMotion();

  const onChange = (next: MensCategory | "all") => {
    setCategory(next);
    if (typeof window === "undefined") return;
    window.requestAnimationFrame(() => {
      document.getElementById("menswear-looks")?.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
        block: "start",
      });
    });
  };

  return (
    <>
      <MenswearCategories active={category} onChange={onChange} />
      <MenswearChapters category={category} />
    </>
  );
}
