"use client";

import { api } from "@/lib/api/client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "./AuthProvider";
import Icon, { type IconName } from "./Icon";
import { StudioMark } from "./Iso";

type NavItem = {
  href: string;
  label: string;
  icon: IconName;
  adminOnly?: boolean;
  badge?: "enquiries" | "orders";
};

const NAV: { heading?: string; items: NavItem[] }[] = [
  { items: [{ href: "/admin", label: "Dashboard", icon: "chart" }] },
  {
    heading: "Sales",
    items: [{ href: "/admin/orders", label: "Orders", icon: "receipt", badge: "orders" }],
  },
  {
    heading: "Website",
    items: [
      { href: "/admin/content", label: "Website content", icon: "edit" },
      { href: "/admin/media", label: "Media library", icon: "image" },
    ],
  },
  {
    heading: "Catalogue",
    items: [
      { href: "/admin/products", label: "Products", icon: "box" },
      { href: "/admin/collections", label: "Collections", icon: "layers" },
      { href: "/admin/crafts", label: "Crafts", icon: "sparkle" },
    ],
  },
  {
    heading: "House",
    items: [
      { href: "/admin/enquiries", label: "Enquiries", icon: "inbox", badge: "enquiries" },
      { href: "/admin/users", label: "Team", icon: "users", adminOnly: true },
    ],
  },
];

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** The CMS frame: sidebar navigation, session guard, isometric canvas. */
export default function AdminShell({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const onLogin = pathname === "/admin/login";
  const [badges, setBadges] = useState({ enquiries: 0, orders: 0 });

  useEffect(() => {
    if (!loading && !user && !onLogin) router.replace("/admin/login");
    if (!loading && user && onLogin) router.replace("/admin");
  }, [loading, user, onLogin, router]);

  useEffect(() => {
    if (!user) return;
    const count = (path: string, status: string) =>
      api
        .list(path, { status, limit: 1 })
        .then((r) => r.meta.total)
        .catch(() => 0);
    Promise.all([count("/admin/enquiries", "new"), count("/admin/orders", "pending")]).then(
      ([enquiries, orders]) => setBadges({ enquiries, orders }),
    );
  }, [user, pathname]);

  if (onLogin) return <>{children}</>;
  if (loading || !user) {
    return (
      <div className="cms-iso-grid grid min-h-screen place-items-center">
        <div className="flex flex-col items-center gap-4">
          <StudioMark size={48} />
          <p className="cms-eyebrow">Opening Kesari Studio</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 flex h-screen w-[252px] shrink-0 flex-col border-r border-[var(--cms-line)] bg-[var(--cms-surface)]">
        <div className="flex items-center gap-3 border-b border-[var(--cms-border)] px-5 py-5">
          <StudioMark />
          <span className="leading-tight">
            <span className="cms-display block text-[16px]">Kesari Studio</span>
            <span className="cms-mono block text-[10.5px] uppercase tracking-[0.1em] text-[var(--cms-muted)]">
              v1 · content & sales
            </span>
          </span>
        </div>

        <nav className="cms-scroll flex-1 space-y-5 overflow-y-auto px-3 py-5">
          {NAV.map((group, gi) => {
            const items = group.items.filter((n) => !n.adminOnly || user.role === "admin");
            if (items.length === 0) return null;
            return (
              <div key={gi}>
                {group.heading && <p className="cms-eyebrow px-3 pb-1.5">{group.heading}</p>}
                <ul className="space-y-1">
                  {items.map((n) => {
                    const active =
                      n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href);
                    const badge = n.badge ? badges[n.badge] : 0;
                    return (
                      <li key={n.href}>
                        <Link
                          href={n.href}
                          className={`group block rounded-[4px] border px-3 transition-all ${
                            active
                              ? "border-[var(--cms-line)] bg-[var(--cms-accent-soft)] shadow-[3px_3px_0_0_var(--cms-line)]"
                              : "border-transparent hover:border-[var(--cms-border)] hover:bg-[var(--cms-sunken)]"
                          }`}
                        >
                          {/* Colour sits on the span: the site's global `a { color: inherit }` overrides utilities on links */}
                          <span
                            className={`flex h-9 items-center gap-3 font-semibold ${
                              active ? "text-[var(--cms-accent-ink)]" : "text-[var(--cms-ink-2)]"
                            }`}
                          >
                            <Icon name={n.icon} />
                            <span className="flex-1">{n.label}</span>
                            {badge > 0 && (
                              <span className="cms-mono grid h-5 min-w-5 place-items-center rounded-[3px] bg-[var(--cms-accent)] px-1.5 text-[10.5px] font-semibold text-white">
                                {badge}
                              </span>
                            )}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        <div className="border-t border-[var(--cms-border)] p-3">
          <a href="/" target="_blank" rel="noreferrer" className="mb-1 block rounded-[4px] px-3 hover:bg-[var(--cms-sunken)]">
            <span className="flex h-9 items-center gap-3 font-semibold text-[var(--cms-ink-2)]">
              <Icon name="external" />
              View website
            </span>
          </a>
          <div className="flex items-center gap-3 px-2 py-2">
            <span className="cms-mono grid h-9 w-9 shrink-0 place-items-center rounded-[4px] border border-[var(--cms-line)] bg-[var(--cms-ink)] text-[12px] font-semibold text-white">
              {initials(user.name)}
            </span>
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block truncate font-semibold">{user.name}</span>
              <span className="cms-mono block truncate text-[10.5px] uppercase tracking-[0.08em] text-[var(--cms-muted)]">
                {user.role}
              </span>
            </span>
            <button
              type="button"
              onClick={logout}
              aria-label="Sign out"
              title="Sign out"
              className="grid h-8 w-8 place-items-center rounded-[4px] text-[var(--cms-muted)] hover:bg-[var(--cms-sunken)] hover:text-[var(--cms-ink)]"
            >
              <Icon name="logout" />
            </button>
          </div>
        </div>
      </aside>

      <main className="cms-iso-grid min-w-0 flex-1">{children}</main>
    </div>
  );
}
