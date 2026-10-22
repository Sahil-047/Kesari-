"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SiteLogo } from "@/components/brand/site-logo";
import { FullMenu } from "@/components/nav/full-menu";
import { useBag } from "@/context/bag-context";
import { useWishlist } from "@/context/wishlist-context";
import { classNames } from "@/lib/format";
import { navLinks } from "@/lib/site";

function MenuMark({ open }: { open: boolean }) {
  return (
    <span className="relative block h-3.5 w-5" aria-hidden="true">
      <span
        className={`absolute left-0 h-px w-full bg-current transition-transform duration-300 ${
          open ? "top-1.5 rotate-45" : "top-0"
        }`}
      />
      <span
        className={`absolute top-1.5 left-0 h-px w-full bg-current transition-opacity duration-300 ${
          open ? "opacity-0" : "opacity-100"
        }`}
      />
      <span
        className={`absolute left-0 h-px w-full bg-current transition-transform duration-300 ${
          open ? "top-1.5 -rotate-45" : "top-3"
        }`}
      />
    </span>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const cinema = pathname === "/";
  const { count, setOpen } = useBag();
  const { items } = useWishlist();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY.current;
      lastY.current = y;

      setScrolled(y > 24);

      if (y < 48) {
        setHidden(false);
        return;
      }

      if (delta > 8) {
        setHidden(true);
        setMenuOpen(false);
      } else if (delta < -8) {
        setHidden(false);
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const cream = cinema;
  const barClass = cinema
    ? "text-cream"
    : "border-b border-gold/20 bg-paper/88 text-ink backdrop-blur-md";

  return (
    <>
      <header
        className={classNames(
          "fixed top-0 right-0 left-0 z-50 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
          barClass,
          hidden ? "-translate-y-full" : "translate-y-0",
        )}
      >
        {cinema ? (
          <div
            className={classNames("header-veil", scrolled && "is-on")}
            aria-hidden="true"
          />
        ) : null}

        <div className="relative z-10 mx-auto grid max-w-[1600px] grid-cols-[1fr_auto_1fr] items-center gap-x-4 px-4 pt-3 pb-2 md:px-8 md:pt-4">
          <div className="justify-self-start">
            <button
              type="button"
              className="nav-link flex items-center gap-3 lg:hidden"
              onClick={() => setMenuOpen((value) => !value)}
              aria-expanded={menuOpen}
            >
              <MenuMark open={menuOpen} />
              Menu
            </button>
          </div>

          <SiteLogo tone={cream ? "cream" : "ink"} compact={false} />

          <div className="flex items-center justify-self-end gap-4 sm:gap-6">
            <Link href="/wishlist" className="nav-link hidden sm:inline">
              Wishlist{items.length ? ` (${items.length})` : ""}
            </Link>
            <button type="button" className="nav-link" onClick={() => setOpen(true)}>
              Bag{count ? ` (${count})` : ""}
            </button>
          </div>
        </div>

        <nav className="relative z-10 hidden flex-wrap items-center justify-center gap-x-6 gap-y-2 px-6 pt-3 pb-4 lg:flex xl:gap-x-8">
          {navLinks.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={classNames(
                  "nav-link shrink-0 pb-0.5 transition-opacity duration-300",
                  active ? "opacity-100" : "opacity-70 hover:opacity-100",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <FullMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
