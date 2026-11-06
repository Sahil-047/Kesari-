"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useBagWishlist } from "@/context/BagWishlistContext";
import { NAV_LINKS } from "@/lib/data";
import { useReducedMotionSafe } from "@/lib/motion";
import Logo from "./Logo";

type HeaderProps = {
  variant?: "overlay" | "solid";
};

function isActive(pathname: string, href: string) {
  if (pathname === href || pathname.startsWith(`${href}/`)) return true;
  if (href === "/products") {
    return pathname.startsWith("/product_detail/") || pathname.startsWith("/product/");
  }
  return false;
}

export default function Header({ variant = "solid" }: HeaderProps) {
  const pathname = usePathname();
  const overlay = variant === "overlay";
  const { bag } = useBagWishlist();
  const count = bag.length;
  const reduce = useReducedMotionSafe();

  const headerRef = useRef<HTMLElement>(null);
  const lastY = useRef(0);
  const [collapsed, setCollapsed] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [spacerH, setSpacerH] = useState(0);

  useEffect(() => {
    if (overlay) return;
    const el = headerRef.current;
    if (!el) return;

    const measure = () => setSpacerH(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [overlay, pathname]);

  useEffect(() => {
    if (reduce) {
      setCollapsed(false);
      setScrolled(window.scrollY > 16);
      return;
    }

    lastY.current = window.scrollY;
    setScrolled(window.scrollY > 16);
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY.current;

        setScrolled(y > 16);

        if (y < 40) {
          setCollapsed(false);
        } else if (delta > 3) {
          setCollapsed(true);
        } else if (delta < -3) {
          setCollapsed(false);
        }

        lastY.current = y;
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [reduce]);

  const atTopSurface = overlay
    ? "bg-gradient-to-b from-black/45 via-black/20 to-transparent"
    : "bg-transparent";

  return (
    <>
      {!overlay && <div style={{ height: spacerH }} aria-hidden className="shrink-0" />}
      <header
        ref={headerRef}
        className={`site-header fixed inset-x-0 top-0 z-40 w-full will-change-transform ${
          scrolled ? "site-header--frost bg-transparent" : atTopSurface
        } ${overlay ? "text-white" : "text-ink"} ${
          collapsed && !reduce ? "site-header--collapsed" : ""
        } ${reduce ? "site-header--static" : ""}`}
      >
        <div className="section-pad relative mx-auto grid max-w-[1680px] grid-cols-[auto_1fr_auto] items-center gap-4 py-4 md:gap-8 md:py-5">
          <div className="justify-self-start">
            <Logo tone={overlay ? "light" : "dark"} size="sm" href="/" />
          </div>

          <nav
            className="hidden items-center justify-center gap-x-5 lg:flex xl:gap-x-7"
            aria-label="Primary"
          >
            {NAV_LINKS.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link ${active ? "nav-link--active" : ""}`}
                  aria-current={active ? "page" : undefined}
                  tabIndex={collapsed ? -1 : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center justify-end gap-1 justify-self-end sm:gap-2">
            <Link href="/wishlist" className="nav-link" tabIndex={collapsed ? -1 : undefined}>
              Wishlist
            </Link>
            <Link
              href="/bag"
              className="nav-link inline-flex items-baseline gap-1.5"
              aria-label={`Bag, ${count} item${count === 1 ? "" : "s"}`}
              tabIndex={collapsed ? -1 : undefined}
            >
              Bag
              {count > 0 && (
                <span key={count} className="bag-count tabular-nums">
                  ({count})
                </span>
              )}
            </Link>
          </div>
        </div>

        <nav
          className="section-pad mx-auto flex max-w-[1680px] gap-1 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden"
          aria-label="Primary"
        >
          {NAV_LINKS.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link shrink-0 ${active ? "nav-link--active" : ""}`}
                aria-current={active ? "page" : undefined}
                tabIndex={collapsed ? -1 : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </header>
    </>
  );
}
