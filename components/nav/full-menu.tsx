"use client";

import Link from "next/link";
import { navLinks } from "@/lib/site";
import { GoldRule } from "@/components/paper/gold-rule";

type FullMenuProps = {
  open: boolean;
  onClose: () => void;
  tone?: "cream" | "ink";
};

export function FullMenu({ open, onClose }: FullMenuProps) {
  return (
    <div
      className={`fixed inset-0 z-[60] transition-opacity duration-500 ${
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <button
        type="button"
        className="absolute inset-0 bg-ink/55"
        aria-label="Close menu"
        onClick={onClose}
      />
      <aside
        className={`absolute inset-y-0 left-0 flex w-full max-w-md flex-col border-r border-gold/25 bg-paper/95 px-8 py-10 shadow-[20px_0_60px_rgba(40,24,12,0.28)] backdrop-blur-md transition-transform duration-500 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-10 flex items-center justify-between">
          <p className="nav-link text-ink-soft">The house</p>
          <button type="button" className="nav-link text-ink" onClick={onClose}>
            Close
          </button>
        </div>
        <GoldRule align="left" className="mb-8" />
        <nav className="flex flex-col gap-5">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="font-serif text-3xl tracking-[0.12em] text-ink uppercase transition-colors hover:text-gold"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto space-y-3 pt-12">
          <GoldRule align="left" />
          <p className="script-line text-2xl text-gold">by Bhumika Patel</p>
          <p className="max-w-xs text-sm leading-relaxed text-ink-soft">
            Atelier visits by appointment. Cloth is shown in natural light,
            never under a shop lamp.
          </p>
        </div>
      </aside>
    </div>
  );
}
