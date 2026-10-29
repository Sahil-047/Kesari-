"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type Ctx = {
  wishlist: string[];
  bag: string[];
  toggleWishlist: (slug: string) => void;
  addToBag: (slug: string) => void;
  removeFromBag: (slug: string) => void;
  isSaved: (slug: string) => boolean;
};

const BagWishlistContext = createContext<Ctx | null>(null);

export function BagWishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [bag, setBag] = useState<string[]>([]);

  const toggleWishlist = useCallback((slug: string) => {
    setWishlist((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }, []);

  const addToBag = useCallback((slug: string) => {
    setBag((prev) => (prev.includes(slug) ? prev : [...prev, slug]));
  }, []);

  const removeFromBag = useCallback((slug: string) => {
    setBag((prev) => prev.filter((s) => s !== slug));
  }, []);

  const isSaved = useCallback(
    (slug: string) => wishlist.includes(slug),
    [wishlist],
  );

  const value = useMemo(
    () => ({
      wishlist,
      bag,
      toggleWishlist,
      addToBag,
      removeFromBag,
      isSaved,
    }),
    [wishlist, bag, toggleWishlist, addToBag, removeFromBag, isSaved],
  );

  return (
    <BagWishlistContext.Provider value={value}>
      {children}
    </BagWishlistContext.Provider>
  );
}

export function useBagWishlist() {
  const ctx = useContext(BagWishlistContext);
  if (!ctx) {
    throw new Error("useBagWishlist must be used within BagWishlistProvider");
  }
  return ctx;
}
