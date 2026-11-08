"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
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
  const menuId = useId();

  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const lastY = useRef(0);
  const [collapsed, setCollapsed] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [spacerH, setSpacerH] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
    setCollapsed(false);
    setScrolled(false);
    lastY.current = 0;
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (overlay) return;
    const el = headerRef.current;
    if (!el) return;

    const measure = () => setSpacerH(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [overlay, pathname, menuOpen]);

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

        if (menuOpen || y < 40) {
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
  }, [reduce, menuOpen]);

  const atTopSurface = overlay
    ? "bg-gradient-to-b from-black/45 via-black/20 to-transparent"
    : "bg-transparent";

  const inkTone = overlay && !menuOpen ? "text-white" : "text-ink";

  return (
    <>
      {!overlay && <div style={{ height: spacerH }} aria-hidden className="shrink-0" />}
      <header
        ref={headerRef}
        className={`site-header fixed inset-x-0 top-0 z-40 w-full will-change-transform ${
          menuOpen
            ? "bg-cream text-ink"
            : scrolled
              ? "site-header--frost bg-transparent"
              : atTopSurface
        } ${inkTone} ${
          collapsed && !reduce && !menuOpen ? "site-header--collapsed" : ""
        } ${reduce ? "site-header--static" : ""}`}
      >
        {/* Mobile / tablet: hamburger left · logo center · bag right */}
        <div className="section-pad relative z-[2] mx-auto grid max-w-[1680px] grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] items-center py-2.5 sm:py-3 lg:hidden">
          <button
            ref={menuButtonRef}
            type="button"
            className="hamburger justify-self-start"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls={menuId}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className={`hamburger-line ${menuOpen ? "hamburger-line--top" : ""}`} />
            <span className={`hamburger-line ${menuOpen ? "hamburger-line--mid" : ""}`} />
            <span className={`hamburger-line ${menuOpen ? "hamburger-line--bot" : ""}`} />
          </button>

          <div className="flex min-w-0 justify-center justify-self-center">
            <Logo
              tone={overlay && !menuOpen ? "light" : "dark"}
              size="sm"
              href="/"
            />
          </div>

          <Link
            href="/bag"
            className="nav-link justify-self-end !min-h-11 !px-0"
            aria-label={`Bag, ${count} item${count === 1 ? "" : "s"}`}
            tabIndex={collapsed || menuOpen ? -1 : undefined}
          >
            Bag
            {count > 0 && (
              <span key={count} className="bag-count ml-1 tabular-nums">
                ({count})
              </span>
            )}
          </Link>
        </div>

        {/* Desktop: logo · nav · wishlist/bag */}
        <div className="section-pad relative z-[2] mx-auto hidden max-w-[1680px] grid-cols-[minmax(0,auto)_minmax(0,1fr)_minmax(0,auto)] items-center gap-8 py-5 lg:grid">
          <div className="min-w-0 justify-self-start">
            <Logo
              tone={overlay && !menuOpen ? "light" : "dark"}
              size="sm"
              href="/"
            />
          </div>

          <nav
            className="flex items-center justify-center gap-x-5 xl:gap-x-7"
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

          <div className="flex shrink-0 items-center justify-end gap-2 justify-self-end">
            <Link
              href="/wishlist"
              className="nav-link"
              tabIndex={collapsed ? -1 : undefined}
            >
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
      </header>

      <div
        id={menuId}
        className={`mobile-nav lg:hidden ${menuOpen ? "mobile-nav--open" : ""}`}
        aria-hidden={!menuOpen}
        {...(!menuOpen ? { inert: true as const } : {})}
      >
        <button
          type="button"
          className="mobile-nav__scrim"
          aria-label="Close menu"
          tabIndex={menuOpen ? 0 : -1}
          onClick={() => {
            setMenuOpen(false);
            menuButtonRef.current?.focus();
          }}
        />
        <nav className="mobile-nav__panel" aria-label="Primary">
          <ul className="mobile-nav__list">
            {NAV_LINKS.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`mobile-nav__link ${active ? "mobile-nav__link--active" : ""}`}
                    aria-current={active ? "page" : undefined}
                    tabIndex={menuOpen ? 0 : -1}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mobile-nav__meta">
            <Link
              href="/wishlist"
              className="mobile-nav__link mobile-nav__link--meta"
              tabIndex={menuOpen ? 0 : -1}
              onClick={() => setMenuOpen(false)}
            >
              Wishlist
            </Link>
            <Link
              href="/bag"
              className="mobile-nav__link mobile-nav__link--meta"
              aria-label={`Bag, ${count} item${count === 1 ? "" : "s"}`}
              tabIndex={menuOpen ? 0 : -1}
              onClick={() => setMenuOpen(false)}
            >
              Bag{count > 0 ? ` (${count})` : ""}
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}
