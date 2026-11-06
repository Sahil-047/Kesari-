"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getProduct, type Product } from "@/lib/data";

/**
 * Bag and wishlist, keyed by product slug (what the order API prices by).
 * A snapshot of each product is kept with its key, so CMS pieces, which are
 * not in the static catalogue, still show in the bag and the wishlist.
 */
type Ctx = {
  wishlist: string[];
  bag: string[];
  toggleWishlist: (product: Product) => void;
  addToBag: (product: Product) => void;
  removeFromBag: (slug: string) => void;
  isSaved: (slug: string) => boolean;
  /** The product behind a bag or wishlist key. */
  productFor: (slug: string) => Product | undefined;
};

const BagWishlistContext = createContext<Ctx | null>(null);

export function BagWishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [bag, setBag] = useState<string[]>([]);
  const [known, setKnown] = useState<Record<string, Product>>({});

  const remember = useCallback((product: Product) => {
    setKnown((prev) => (prev[product.slug] === product ? prev : { ...prev, [product.slug]: product }));
  }, []);

  const toggleWishlist = useCallback(
    (product: Product) => {
      remember(product);
      setWishlist((prev) =>
        prev.includes(product.slug) ? prev.filter((s) => s !== product.slug) : [...prev, product.slug],
      );
    },
    [remember],
  );

  const addToBag = useCallback(
    (product: Product) => {
      remember(product);
      setBag((prev) => (prev.includes(product.slug) ? prev : [...prev, product.slug]));
    },
    [remember],
  );

  const removeFromBag = useCallback((slug: string) => {
    setBag((prev) => prev.filter((s) => s !== slug));
  }, []);

  const isSaved = useCallback((slug: string) => wishlist.includes(slug), [wishlist]);

  const productFor = useCallback((slug: string) => known[slug] ?? getProduct(slug), [known]);

  const value = useMemo(
    () => ({ wishlist, bag, toggleWishlist, addToBag, removeFromBag, isSaved, productFor }),
    [wishlist, bag, toggleWishlist, addToBag, removeFromBag, isSaved, productFor],
  );

  return <BagWishlistContext.Provider value={value}>{children}</BagWishlistContext.Provider>;
}

export function useBagWishlist() {
  const ctx = useContext(BagWishlistContext);
  if (!ctx) {
    throw new Error("useBagWishlist must be used within BagWishlistProvider");
  }
  return ctx;
}
