"use client";

import { BagProvider } from "@/context/bag-context";
import { WishlistProvider } from "@/context/wishlist-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <BagProvider>
      <WishlistProvider>{children}</WishlistProvider>
    </BagProvider>
  );
}
