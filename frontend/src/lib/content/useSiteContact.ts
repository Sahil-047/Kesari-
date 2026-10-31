"use client";

import { API_URL } from "@/lib/api/client";
import { useEffect, useState } from "react";
import { PAGE_DEFAULTS, type SiteContent } from "./pages";

type Contact = SiteContent["contact"];

let cached: Promise<Contact> | null = null;

/** Published contact settings (WhatsApp number etc.), fetched once per visit. */
function loadContact(): Promise<Contact> {
  cached ??= fetch(`${API_URL}/pages/site`)
    .then((r) => (r.ok ? r.json() : null))
    .then((json) => ({ ...PAGE_DEFAULTS.site.contact, ...json?.data?.content?.contact }))
    .catch(() => PAGE_DEFAULTS.site.contact);
  return cached;
}

export function useSiteContact(): Contact {
  const [contact, setContact] = useState<Contact>(PAGE_DEFAULTS.site.contact);
  useEffect(() => {
    let alive = true;
    loadContact().then((c) => alive && setContact(c));
    return () => {
      alive = false;
    };
  }, []);
  return contact;
}

/** wa.me link to the house, or null when no number is set. */
export function houseWhatsappLink(number: string, text: string): string | null {
  let digits = number.replace(/\D/g, "");
  if (digits.length === 10) digits = `91${digits}`;
  if (digits.length < 10) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
