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

const STORAGE_KEY = "kesari.bag";

export type BagLine = {
  slug: string;
  size: string;
  qty: number;
};

type BagContextValue = {
  lines: BagLine[];
  ready: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (slug: string, size: string, qty?: number) => void;
  remove: (slug: string, size: string) => void;
  setQty: (slug: string, size: string, qty: number) => void;
  count: number;
  subtotal: number;
  items: Array<BagLine & { product: Product }>;
};

const BagContext = createContext<BagContextValue | null>(null);

function readBag(): BagLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as BagLine[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function BagProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<BagLine[]>([]);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const stored = readBag();
    startTransition(() => {
      setLines(stored);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (ready) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    }
  }, [lines, ready]);

  const add = useCallback((slug: string, size: string, qty = 1) => {
    setLines((current) => {
      const match = current.find((line) => line.slug === slug && line.size === size);
      if (match) {
        return current.map((line) =>
          line.slug === slug && line.size === size
            ? { ...line, qty: line.qty + qty }
            : line,
        );
      }
      return [...current, { slug, size, qty }];
    });
    setOpen(true);
  }, []);

  const remove = useCallback((slug: string, size: string) => {
    setLines((current) =>
      current.filter((line) => !(line.slug === slug && line.size === size)),
    );
  }, []);

  const setQty = useCallback((slug: string, size: string, qty: number) => {
    setLines((current) =>
      current
        .map((line) =>
          line.slug === slug && line.size === size ? { ...line, qty } : line,
        )
        .filter((line) => line.qty > 0),
    );
  }, []);

  const items = useMemo(
    () =>
      lines
        .map((line) => {
          const product = getProduct(line.slug);
          return product ? { ...line, product } : null;
        })
        .filter((line): line is BagLine & { product: Product } => line !== null),
    [lines],
  );

  const count = items.reduce((sum, line) => sum + line.qty, 0);
  const subtotal = items.reduce((sum, line) => sum + line.product.price * line.qty, 0);

  const value = useMemo(
    () => ({
      lines,
      ready,
      open,
      setOpen,
      add,
      remove,
      setQty,
      count,
      subtotal,
      items,
    }),
    [lines, ready, open, add, remove, setQty, count, subtotal, items],
  );

  return <BagContext.Provider value={value}>{children}</BagContext.Provider>;
}

export function useBag() {
  const ctx = useContext(BagContext);
  if (!ctx) {
    throw new Error("useBag must be used within BagProvider");
  }
  return ctx;
}
