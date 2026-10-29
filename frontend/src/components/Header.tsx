"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/lib/data";
import Logo from "./Logo";

type HeaderProps = {
  variant?: "overlay" | "solid";
};

export default function Header({ variant = "solid" }: HeaderProps) {
  const pathname = usePathname();
  const overlay = variant === "overlay";
  const tone = overlay ? "text-white" : "text-ink";

  return (
    <header
      className={`z-40 w-full ${
        overlay ? "absolute inset-x-0 top-0 bg-transparent" : "relative bg-transparent"
      } ${tone}`}
    >
      <div className="section-pad relative grid grid-cols-[1fr_auto_1fr] items-start gap-3 pt-5 pb-2 md:gap-6 md:pt-6 md:pb-3">
        {/* Logo — top left */}
        <div className="justify-self-start">
          <Logo tone={overlay ? "light" : "dark"} size="sm" href="/" />
        </div>

        {/* Nav — center */}
        <nav
          className="hidden items-center justify-center gap-x-5 pt-2 lg:gap-x-7 md:flex"
          aria-label="Primary"
        >
          {NAV_LINKS.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${active ? "opacity-100" : "opacity-75"}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Utilities — top right */}
        <div className="flex items-center justify-end gap-5 justify-self-end pt-2">
          <Link href="/wishlist" className="nav-link">
            Wishlist
          </Link>
          <Link href="/bag" className="nav-link">
            Bag
          </Link>
        </div>
      </div>

      <nav
        className="section-pad flex gap-5 overflow-x-auto pb-3 md:hidden"
        aria-label="Mobile"
      >
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="nav-link shrink-0">
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
