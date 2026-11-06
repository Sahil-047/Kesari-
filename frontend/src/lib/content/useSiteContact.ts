"use client";

import { API_URL } from "@/lib/api/client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { PAGE_DEFAULTS, type SiteContent } from "./pages";

export type Contact = SiteContent["contact"];

let cached: Promise<Contact> | null = null;

/** Published contact settings (WhatsApp number etc.), fetched once per visit. */
function loadContact(): Promise<Contact> {
  cached ??= fetch(`${API_URL}/pages/site`)
    .then((r) => (r.ok ? r.json() : null))
    .then((json) => ({ ...PAGE_DEFAULTS.site.contact, ...json?.data?.content?.contact }))
    .catch(() => PAGE_DEFAULTS.site.contact);
  return cached;
}

/** Prefer a server-seeded `initial` so the first paint already has CMS values. */
export function useSiteContact(initial?: Contact): Contact {
  const pathname = usePathname();
  const onAdmin = Boolean(pathname?.startsWith("/admin"));
  const [contact, setContact] = useState<Contact>(initial ?? PAGE_DEFAULTS.site.contact);

  useEffect(() => {
    // Studio never needs the public WhatsApp number; skip the /pages/site round-trip.
    if (onAdmin) return;
    // Server already passed contact — don't refetch on mount.
    if (initial) return;
    let alive = true;
    loadContact().then((c) => alive && setContact(c));
    return () => {
      alive = false;
    };
  }, [onAdmin, initial]);

  return contact;
}

/** wa.me link to the house, or null when no number is set. */
export function houseWhatsappLink(number: string, text: string): string | null {
  let digits = number.replace(/\D/g, "");
  if (digits.length === 10) digits = `91${digits}`;
  if (digits.length < 10) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
