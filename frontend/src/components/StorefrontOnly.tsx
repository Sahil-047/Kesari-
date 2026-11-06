"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Renders children only on the public site — not under /admin. */
export default function StorefrontOnly({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return children;
}
