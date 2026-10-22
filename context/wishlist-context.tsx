"use client";

import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getProduct, type Product } from "@/lib/catalog";

const STORAGE_KEY = "kesari.wishlist";

type WishlistContextValue = {
  slugs: string[];
  ready: boolean;
  toggle: (slug: string) => void;
  has: (slug: string) => boolean;
  items: Product[];
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let next: string[] = [];
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as string[];
      next = Array.isArray(parsed) ? parsed : [];
    } catch {
      next = [];
    }
    startTransition(() => {
      setSlugs(next);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (ready) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
    }
  }, [slugs, ready]);

  const toggle = useCallback((slug: string) => {
    setSlugs((current) =>
      current.includes(slug)
        ? current.filter((item) => item !== slug)
        : [...current, slug],
    );
  }, []);

  const has = useCallback((slug: string) => slugs.includes(slug), [slugs]);

  const items = useMemo(
    () => slugs.map(getProduct).filter((item): item is Product => Boolean(item)),
    [slugs],
  );

  const value = useMemo(
    () => ({ slugs, ready, toggle, has, items }),
    [slugs, ready, toggle, has, items],
  );

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return ctx;
}
