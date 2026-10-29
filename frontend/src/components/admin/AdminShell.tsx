"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "./AuthProvider";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/edit", label: "The Edit" },
  { href: "/admin/collections", label: "Collections" },
  { href: "/admin/crafts", label: "Crafts" },
  { href: "/admin/enquiries", label: "Enquiries" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/users", label: "Users", adminOnly: true },
];

/** Sidebar layout for the CMS; sends signed-out visitors to the login page. */
export default function AdminShell({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const onLogin = pathname === "/admin/login";

  useEffect(() => {
    if (!loading && !user && !onLogin) router.replace("/admin/login");
    if (!loading && user && onLogin) router.replace("/admin");
  }, [loading, user, onLogin, router]);

  if (onLogin) return <>{children}</>;
  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f4efe6] font-sans text-sm text-ink/60">
        Checking your session…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f4efe6] font-sans text-ink">
      <aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col bg-[#14100b] text-cream">
        <div className="px-6 pb-6 pt-7">
          <p className="display text-xl uppercase tracking-[0.18em]">Kesari</p>
          <p className="mt-1 text-[0.6rem] uppercase tracking-[0.3em] text-cream/50">CMS</p>
        </div>
        <nav className="flex-1 space-y-0.5 px-3">
          {NAV.filter((n) => !n.adminOnly || user.role === "admin").map((n) => {
            const active = n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`block rounded px-3 py-2 text-sm transition-colors ${
                  active ? "bg-cream/10" : "hover:bg-cream/5"
                }`}
              >
                <span className={active ? "text-cream" : "text-cream/65"}>{n.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-cream/10 px-6 py-5 text-xs">
          <p className="truncate text-cream/80">{user.name}</p>
          <p className="truncate text-cream/45">
            {user.email} · {user.role}
          </p>
          <button
            type="button"
            onClick={logout}
            className="mt-3 text-cream/60 underline-offset-4 hover:text-cream hover:underline"
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-8 py-8 lg:px-12">{children}</main>
    </div>
  );
}
